package middleware

import (
	"net/http"
	"strings"

	"github.com/Lunita-Code/beautiful-health/internal/auth"   // Necesario para la función ValidateToken
	"github.com/Lunita-Code/beautiful-health/internal/logger" // Para logging contextual
	"github.com/gin-gonic/gin"                        // Framework web Gin
	"go.uber.org/zap"                                 // Logger estructurado
)

// Keys para almacenar valores en el contexto de Gin
const (
	UserIDKey = "userID"
	RolIDKey  = "rolID"
)

// AuthMiddleware es un middleware que verifica la validez de un token JWT
// y extrae el UserID y RolID del token, poniéndolos a disposición en el contexto de Gin.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		log := logger.FromContext(c.Request.Context()) // Obtiene el logger contextual

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			log.Warn("Intento de acceso sin token JWT", zap.String("path", c.Request.URL.Path))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token JWT requerido"})
			return
		}

		// Verifica que tenga el formato "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Warn("Formato de token JWT inválido", zap.String("auth_header", authHeader))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de token JWT inválido"})
			return
		}
		tokenString := parts[1]

		// Valida el token JWT
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			log.Warn("Token JWT inválido o expirado", zap.Error(err))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token JWT inválido o expirado"})
			return
		}

		// Validación extra: que los claims tengan datos
		if claims.UserID == "" || claims.RolID == 0 {
			log.Warn("Claims JWT incompletos", zap.Any("claims", claims))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Claims inválidos en el token"})
			return
		}

		// Setea en el contexto
		c.Set(UserIDKey, claims.UserID)
		c.Set(RolIDKey, claims.RolID)
		log.Info("Token JWT verificado exitosamente",
			zap.String("user_id", claims.UserID),
			zap.Int("rol_id", claims.RolID),
		)

		c.Next()
	}
}
