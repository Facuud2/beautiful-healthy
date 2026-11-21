package handlers

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Lunita-Code/beautiful-health/internal/auth"
	"github.com/Lunita-Code/beautiful-health/internal/models"
	"github.com/Lunita-Code/beautiful-health/internal/security"
	"github.com/Lunita-Code/beautiful-health/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"go.uber.org/zap"
)

// LoginRequest es el modelo para el cuerpo de la solicitud de login.
type LoginRequest struct {
	// El nombre de usuario.
	Username string `json:"username" binding:"required" example:"usuario.medico"`
	// La contraseña del usuario.
	Password string `json:"password" binding:"required" example:"password123"`
}

// LoginResponse es el modelo para una respuesta exitosa de login.
type LoginResponse struct {
	// Mensaje de éxito.
	Message string `json:"message" example:"Login exitoso"`
	// El token de acceso JWT.
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNCIsImV4cCI6MTY3MjUxODIwMH0.CjI_h3Lz_y1c..."`
	// Datos del usuario logueado.
	User UserData `json:"user"`
	// Fecha y hora de expiración del token de acceso.
	Expires string `json:"expires" example:"2025-08-27T10:00:00Z"`
}

// UserData es la estructura de datos del usuario en la respuesta.
type UserData struct {
	ID            string `json:"id" example:"f47ac10b-58cc-4372-a567-0e02b2c3d479"`
	Nombre        string `json:"nombre" example:"Usuario Médico"`
	Email         string `json:"email" example:"usuario.medico@example.com"`
	RolID         int    `json:"rol_id" example:"1"`
	ConsultorioID string `json:"consultorio_id" example:"f47ac10b-58cc-4372-a567-0e02b2c3d479"`
	Activo        bool   `json:"activo" example:"true"`
	CreadoEn      string `json:"creado_en" example:"2025-08-20T10:00:00Z"`
}

// RefreshTokenRequest es el modelo para la solicitud de refresh token.
type RefreshTokenRequest struct {
	// El refresh token para obtener un nuevo access token.
	RefreshToken string `json:"refresh_token" binding:"required" example:"a439f042-8321-432a-b615-56f8f1c8d76a"`
}

// RefreshTokenResponse es el modelo para la respuesta de un refresh exitoso.
type RefreshTokenResponse struct {
	// El nuevo token de acceso.
	AccessToken string `json:"access_token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNCIsImV4cCI6MTY3MjUxODIwMH0.CjI_h3Lz_y1c..."`
}

// ErrorResponse es un modelo para las respuestas de error.
type ErrorResponse struct {
	// El mensaje de error.
	Error string `json:"error" example:"Credenciales inválidas"`
}

// DBTX define la interfaz mínima para la base de datos usada en AuthHandler
type DBTX interface {
	QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row
	Exec(ctx context.Context, sql string, args ...interface{}) (pgconn.CommandTag, error)
}

type AuthHandler struct {
	logger         *zap.Logger
	db             DBTX
	generateToken  func(userID string, rolID int) (string, error)
	verifyPassword func(plain, hash string) bool
	redisService   *services.RedisService
}

// NewAuthHandler crea un AuthHandler; opcionalmente se puede pasar un *services.RedisService
// como tercer parámetro (variádico) para producción. Tests pueden llamar con solo (logger, db).
func NewAuthHandler(logger *zap.Logger, db DBTX, redisSvc ...*services.RedisService) *AuthHandler {
	var rs *services.RedisService
	if len(redisSvc) > 0 {
		rs = redisSvc[0]
	}

	return &AuthHandler{
		logger:         logger,
		db:             db,
		generateToken:  auth.GenerateToken,
		verifyPassword: security.CheckPasswordHash,
		redisService:   rs,
	}
}

// NewAuthHandlerWithRedis crea un AuthHandler incluyendo un servicio de Redis.
// Mantiene compatibilidad con el entrypoint del servidor que inicializa Redis.
func NewAuthHandlerWithRedis(logger *zap.Logger, db DBTX, redisSvc *services.RedisService) *AuthHandler {
	return NewAuthHandler(logger, db, redisSvc)
}

// Login godoc
// @Summary      Login de usuario
// @Description  Autenticación de usuario y generación de token JWT
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        loginReq  body  object  true  "Credenciales de acceso"
// @Success      200  {object}  LoginResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Router       /login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	// Usamos el logger del handler en lugar de obtenerlo del contexto
	log := h.logger

	// Pero si quieres mantener el request_id, puedes hacer:
	if requestID, exists := c.Get("request_id"); exists {
		if id, ok := requestID.(string); ok {
			log = h.logger.With(zap.String("request_id", id))
		}
	}

	var loginReq struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Info("Intento de login",
		zap.String("username", loginReq.Username),
		zap.String("ip", c.ClientIP()))

	var user models.Usuario
	var passwordHash string
	var intentosFallidos int
	var ultimoLogin *time.Time
	var err error

	err = h.db.QueryRow(c.Request.Context(), `
		SELECT id, username, nombre, apellido, email, contrasena_hash, rol_id, consultorio_id, 
		   activo, creado_en, intentos_fallidos, ultimo_login
		FROM usuarios 
		WHERE username = $1 AND activo = true
	`, loginReq.Username).Scan(
		&user.ID, &user.Username, &user.Nombre, &user.Apellido, &user.Email, &passwordHash, &user.RolID,
		&user.ConsultorioID, &user.Activo, &user.CreadoEn,
		&intentosFallidos, &ultimoLogin,
	)

	if errors.Is(err, sql.ErrNoRows) {
		h.logger.Warn("Intento de login fallido - usuario no encontrado",
			zap.String("username", loginReq.Username),
			zap.String("ip", c.ClientIP()))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	} else if err != nil {
		log.Error("Error al buscar usuario en la base de datos",
			zap.Error(err),
			zap.String("username", loginReq.Username))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno del servidor"})
		return
	}

	if intentosFallidos >= 5 {
		log.Warn("Intento de login bloqueado - cuenta temporalmente bloqueada",
			zap.String("username", loginReq.Username),
			zap.String("user_id", user.ID.String()),
			zap.Int("intentos_fallidos", intentosFallidos),
			zap.String("ip", c.ClientIP()))

		c.JSON(http.StatusForbidden, gin.H{
			"error": "Cuenta temporalmente bloqueada por demasiados intentos fallidos. Contacte al administrador.",
		})
		return
	}

	if !h.verifyPassword(loginReq.Password, passwordHash) {
		newAttempts := intentosFallidos + 1
		_, execErr := h.db.Exec(c.Request.Context(), `
			UPDATE usuarios 
			SET intentos_fallidos = $1 
			WHERE username = $2
		`, newAttempts, loginReq.Username)

		if execErr != nil {
			log.Error("Error al actualizar intentos fallidos", zap.Error(execErr), zap.String("username", loginReq.Username))
		}

		h.logger.Warn("Intento de login fallido - contraseña incorrecta",
			zap.String("username", loginReq.Username),
			zap.String("ip", c.ClientIP()),
			zap.Int("intentos_fallidos", newAttempts))

		c.JSON(http.StatusUnauthorized, gin.H{
			"error":              "Credenciales inválidas",
			"intentos_restantes": 5 - newAttempts,
		})
		return
	}

	now := time.Now()
	_, execErr := h.db.Exec(c.Request.Context(), `
		UPDATE usuarios 
		SET intentos_fallidos = 0, ultimo_login = $1 
		WHERE username = $2
	`, now, loginReq.Username)

	if execErr != nil {
		log.Error("Error al actualizar datos de login exitoso",
			zap.Error(execErr),
			zap.String("username", loginReq.Username))
	}

	token, tokErr := h.generateToken(user.ID.String(), user.RolID)
	if tokErr != nil {
		log.Error("Error al generar token",
			zap.Error(tokErr),
			zap.String("user_id", user.ID.String()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al generar token"})
		return
	}

	log.Info("Login exitoso",
		zap.String("user_id", user.ID.String()),
		zap.String("email", user.Email),
		zap.String("ip", c.ClientIP()),
		zap.Time("ultimo_login", now),
		zap.Int("rol_id", user.RolID))

	// Configuración de cookie optimizada para desarrollo
	cookie := &http.Cookie{
		Name:     "jwt_token",
		Value:    token,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	}
	
	// Solo establecer Domain en producción
	if c.GetHeader("Host") != "localhost:3000" && c.GetHeader("Host") != "localhost:6060" {
		cookie.Domain = "localhost"
	}
	
	http.SetCookie(c.Writer, cookie)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login exitoso",
		"token":   token,
		"user": gin.H{
			"nombre":         user.Nombre,
			"email":          user.Email,
			"rol_id":         user.RolID,
			"consultorio_id": user.ConsultorioID,
			"activo":         user.Activo,
			"creado_en":      user.CreadoEn,
		},
	})
}

// Register godoc
// @Summary      Registrar nuevo usuario
// @Description  Crea una nueva cuenta de usuario
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        registerReq  body  object  true  "Datos de registro"
// @Success      201  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var input struct {
		Nombre        string `json:"nombre" binding:"required"`
		Apellido      string `json:"apellido" binding:"required"`
		Email         string `json:"email" binding:"required,email"`
		Password      string `json:"password" binding:"required,min=6"`
		RolID         int    `json:"rol_id" binding:"required"`
		ConsultorioID string `json:"consultorio_id" binding:"required,uuid"`
		Activo        bool   `json:"activo"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	consultorioUUID, err := uuid.Parse(input.ConsultorioID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Consultorio ID inválido"})
		return
	}

	userID := uuid.New()

	hashedPassword, err := security.HashPassword(input.Password)
	if err != nil {
		h.logger.Error("Error al hashear la contraseña", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno del servidor"})
		return
	}

	// Generar username: primera letra del nombre + apellido, todo en minúsculas, sin espacios
	username := ""
	if len(input.Nombre) > 0 && len(input.Apellido) > 0 {
		username = strings.ToLower(string([]rune(strings.TrimSpace(input.Nombre))[0]) + strings.ReplaceAll(strings.ToLower(strings.TrimSpace(input.Apellido)), " ", ""))
	}

	_, err = h.db.Exec(c.Request.Context(), `
	       INSERT INTO usuarios (id, username, nombre, apellido, email, contrasena_hash, rol_id, consultorio_id, activo, creado_en)
	       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	   `,
		userID, username, input.Nombre, input.Apellido, input.Email, string(hashedPassword), input.RolID, consultorioUUID, input.Activo, time.Now())

	if err != nil {
		h.logger.Error("Error al guardar usuario en DB", zap.Error(err))
		fmt.Printf("[DEBUG SQL ERROR] %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo registrar el usuario", "detalle": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Usuario registrado exitosamente",
		"id":      userID.String(),
	})
}

// @Summary      Refresca el token de acceso
// @Description  Renueva el token de acceso JWT usando un refresh token almacenado en Redis.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        refresh  body      RefreshTokenRequest  true  "Refresh token"
// @Success      200      {object}  RefreshTokenResponse "Nuevo token de acceso generado"
// @Failure      400      {object}  ErrorResponse        "Refresh token faltante o inválido"
// @Failure      401      {object}  ErrorResponse        "Refresh token expirado o no encontrado en Redis"
// @Failure      500      {object}  ErrorResponse        "Error interno del servidor"
// @Router       /refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	if h.redisService == nil {
		c.JSON(http.StatusNotImplemented, gin.H{"error": "Refresh token no disponible en esta instancia"})
		return
	}

	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token requerido"})
		return
	}

	ctx := context.Background()
	userID, err := h.redisService.Client().Get(ctx, "refresh:"+req.RefreshToken).Result()
	if err == redis.Nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token inválido o expirado"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno"})
		return
	}

	var rolID int
	err = h.db.QueryRow(ctx, `
	SELECT rol_id FROM usuarios WHERE id = $1
`, userID).Scan(&rolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo obtener el rol del usuario"})
		return
	}

	token, err := auth.GenerateToken(userID, rolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo generar token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"access_token": token})
}

// ProtectedEndpoint ejemplo de endpoint protegido
func (h *AuthHandler) ProtectedEndpoint(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token requerido"})
		return
	}

	// Espera formato: "Bearer <token>"
	tokenString := authHeader
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	claims, err := auth.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Acceso autorizado",
		"user_id": claims.UserID,
		"role":    claims.RolID,
		"exp":     claims.ExpiresAt.Time.Format(time.RFC3339),
	})
}

// Logout godoc
// @Summary      Logout de usuario
// @Description  Invalida la cookie de sesión del usuario
// @Tags         auth
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "jwt_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1, // Indica al navegador que elimine la cookie
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false, // Debe coincidir con la configuración de la cookie original
		Domain:   "localhost",
	})

	c.JSON(http.StatusOK, gin.H{"message": "Logout exitoso"})
}
