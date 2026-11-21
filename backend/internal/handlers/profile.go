package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"github.com/Lunita-Code/beautiful-health/internal/models"
	"github.com/Lunita-Code/beautiful-health/internal/security"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type ProfileHandler struct {
	db     DBTX
	logger *zap.Logger
}

func NewProfileHandler(db DBTX, logger *zap.Logger) *ProfileHandler {
	return &ProfileHandler{
		db:     db,
		logger: logger,
	}
}

// GetProfile godoc
// @Summary      Obtener perfil del usuario
// @Description  Obtiene la información del perfil del usuario autenticado
// @Tags         profile
// @Accept       json
// @Produce      json
// @Security     Bearer
// @Success      200  {object}  models.ProfileResponse
// @Failure      401  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /api/profile [get]
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	h.logger.Info("=== INICIO GetProfile ===")

	// Obtener el ID del usuario del token JWT
	userID, exists := c.Get("user_id")
	h.logger.Info("user_id exists", zap.Bool("exists", exists))

	if !exists {
		h.logger.Error("user_id no existe en el contexto")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado"})
		return
	}

	userIDStr, ok := userID.(string)
	h.logger.Info("user_id conversion", zap.Bool("ok", ok), zap.Any("userID", userID))

	if !ok {
		h.logger.Error("user_id no es string", zap.Any("type", userID))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ID de usuario inválido"})
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Error("Error parsing UUID", zap.String("userIDStr", userIDStr), zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	h.logger.Info("Obteniendo perfil de usuario", zap.String("user_id", userIDStr))

	// Consulta completa con todos los campos de perfil, incluyendo consultorio_id
	var nombre, email, apellido, dni, telefono, matriculaProfesional string
	var rolID int
	var activo bool
	var consultorioID sql.NullString

	query := `SELECT nombre, email, rol_id, activo,
		COALESCE(apellido, '') as apellido,
		COALESCE(dni, '') as dni,
		COALESCE(telefono, '') as telefono,
		COALESCE(matricula_profesional, '') as matricula_profesional,
		consultorio_id
		FROM usuarios WHERE id = $1`

	h.logger.Info("Ejecutando consulta completa", zap.String("query", query), zap.String("uuid", userUUID.String()))

	err = h.db.QueryRow(c.Request.Context(), query, userUUID).Scan(
		&nombre, &email, &rolID, &activo, &apellido, &dni, &telefono, &matriculaProfesional, &consultorioID,
	)

	if errors.Is(err, sql.ErrNoRows) {
		h.logger.Warn("Usuario no encontrado", zap.String("user_id", userIDStr))
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	} else if err != nil {
		h.logger.Error("Error real al obtener perfil de usuario", zap.Error(err), zap.String("user_id", userIDStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno del servidor", "detalle": err.Error()})
		return
	}

	// Consultar dirección del consultorio si existe
	var direccionConsultorio *string
	var consultorioIDStr *string
	if consultorioID.Valid && consultorioID.String != "" {
		consultorioIDStr = &consultorioID.String
		var direccion string
		err = h.db.QueryRow(c.Request.Context(), "SELECT direccion FROM consultorios WHERE id = $1", consultorioID.String).Scan(&direccion)
		if err == nil {
			direccionConsultorio = &direccion
		}
	}

	// Respuesta completa con todos los campos
	response := gin.H{
		"id":                    userIDStr,
		"nombre":                nombre,
		"email":                 email,
		"rol_id":                rolID,
		"activo":                activo,
		"apellido":              apellido,
		"dni":                   dni,
		"telefono":              telefono,
		"matricula_profesional": matriculaProfesional,
		"consultorio_id":        consultorioIDStr,
		"direccion_consultorio": direccionConsultorio,
	}

	h.logger.Info("Perfil obtenido exitosamente", zap.String("user_id", userIDStr))
	c.JSON(http.StatusOK, response)
}

// UpdateProfile godoc
// @Summary      Actualizar perfil del usuario
// @Description  Actualiza la información del perfil del usuario autenticado
// @Tags         profile
// @Accept       json
// @Produce      json
// @Security     Bearer
// @Param        profileData  body  models.ProfileUpdateRequest  true  "Datos del perfil"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /api/profile [put]
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	// Obtener el ID del usuario del token JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ID de usuario inválido"})
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var input models.ProfileUpdateRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		h.logger.Warn("Datos de entrada inválidos", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "detalle": err.Error()})
		return
	}

	// Validar que el email no esté en uso por otro usuario
	var existingUserID uuid.UUID
	err = h.db.QueryRow(c.Request.Context(),
		"SELECT id FROM usuarios WHERE email = $1 AND id != $2",
		input.Email, userUUID).Scan(&existingUserID)

	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El email ya está en uso por otro usuario"})
		return
	} else if !errors.Is(err, sql.ErrNoRows) {
		h.logger.Error("Error al verificar email único", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno del servidor"})
		return
	}

	h.logger.Info("Actualizando perfil de usuario", zap.String("user_id", userIDStr))

	// Actualizar la información del usuario
	query := `
		UPDATE usuarios 
		SET nombre = $1, apellido = $2, email = $3, dni = $4, 
		    matricula_profesional = $5, telefono = $6
		WHERE id = $7 AND activo = true
	`

	result, err := h.db.Exec(c.Request.Context(), query,
		input.Nombre,
		input.Apellido,
		input.Email,
		input.DNI,
		input.MatriculaProfesional,
		input.Telefono,
		userUUID,
	)

	if err != nil {
		h.logger.Error("Error al actualizar perfil de usuario", zap.Error(err), zap.String("user_id", userIDStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo actualizar el perfil"})
		return
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	h.logger.Info("Perfil actualizado exitosamente", zap.String("user_id", userIDStr))
	c.JSON(http.StatusOK, gin.H{"message": "Perfil actualizado exitosamente"})
}

// ChangePassword godoc
// @Summary      Cambiar contraseña del usuario
// @Description  Cambia la contraseña del usuario autenticado con validación robusta
// @Tags         profile
// @Accept       json
// @Produce      json
// @Security     Bearer
// @Param        passwordData  body  models.PasswordChangeRequest  true  "Datos del cambio de contraseña"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]interface{}
// @Failure      401  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /api/profile/change-password [post]
func (h *ProfileHandler) ChangePassword(c *gin.Context) {
	// Obtener el ID del usuario del token JWT
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado"})
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "ID de usuario inválido"})
		return
	}

	userUUID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	var input models.PasswordChangeRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		h.logger.Warn("Datos de entrada inválidos", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "detalle": err.Error()})
		return
	}

	// Validar que las contraseñas nuevas coincidan
	if input.NewPassword != input.ConfirmNewPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Las contraseñas nuevas no coinciden"})
		return
	}

	// Validar la fortaleza de la nueva contraseña
	if err := validatePasswordStrength(input.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.logger.Info("Iniciando cambio de contraseña", zap.String("user_id", userIDStr))

	// Obtener la contraseña actual del usuario
	var currentPasswordHash string
	err = h.db.QueryRow(c.Request.Context(),
		"SELECT contrasena_hash FROM usuarios WHERE id = $1 AND activo = true",
		userUUID).Scan(&currentPasswordHash)

	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	} else if err != nil {
		h.logger.Error("Error al obtener contraseña actual", zap.Error(err), zap.String("user_id", userIDStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno del servidor"})
		return
	}

	// Verificar la contraseña actual
	if !security.CheckPasswordHash(input.CurrentPassword, currentPasswordHash) {
		h.logger.Warn("Intento de cambio de contraseña con contraseña actual incorrecta", zap.String("user_id", userIDStr))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "La contraseña actual es incorrecta"})
		return
	}

	// Verificar que la nueva contraseña sea diferente de la actual
	if security.CheckPasswordHash(input.NewPassword, currentPasswordHash) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La nueva contraseña debe ser diferente a la actual"})
		return
	}

	// Hashear la nueva contraseña
	newPasswordHash, err := security.HashPassword(input.NewPassword)
	if err != nil {
		h.logger.Error("Error al hashear nueva contraseña", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno del servidor"})
		return
	}

	// Actualizar la contraseña en la base de datos
	result, err := h.db.Exec(c.Request.Context(),
		"UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2 AND activo = true",
		string(newPasswordHash), userUUID)

	if err != nil {
		h.logger.Error("Error al actualizar contraseña", zap.Error(err), zap.String("user_id", userIDStr))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo actualizar la contraseña"})
		return
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	h.logger.Info("Contraseña cambiada exitosamente", zap.String("user_id", userIDStr))
	c.JSON(http.StatusOK, gin.H{"message": "Contraseña cambiada exitosamente"})
}

// validatePasswordStrength valida la fortaleza de la contraseña
func validatePasswordStrength(password string) error {
	if len(password) < 8 {
		return errors.New("la contraseña debe tener al menos 8 caracteres")
	}

	hasUpper := false
	hasLower := false
	hasDigit := false
	hasSpecial := false

	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			hasUpper = true
		case char >= 'a' && char <= 'z':
			hasLower = true
		case char >= '0' && char <= '9':
			hasDigit = true
		case strings.ContainsRune("!@#$%^&*()_+-=[]{}|;:,.<>?", char):
			hasSpecial = true
		}
	}

	var missing []string
	if !hasUpper {
		missing = append(missing, "al menos una letra mayúscula")
	}
	if !hasLower {
		missing = append(missing, "al menos una letra minúscula")
	}
	if !hasDigit {
		missing = append(missing, "al menos un número")
	}
	if !hasSpecial {
		missing = append(missing, "al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)")
	}

	if len(missing) > 0 {
		return errors.New("la contraseña debe contener: " + strings.Join(missing, ", "))
	}

	return nil
}
