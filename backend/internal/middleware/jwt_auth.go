package middleware

import (
	"fmt"
	"net/http"

	"github.com/Lunita-Code/beautiful-health/internal/auth"
	"github.com/gin-gonic/gin"
)

// JWTAuthMiddleware protege rutas y extrae claims del token JWT
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// 1. Intentar obtener el token de la cookie primero
		cookie, err := c.Cookie("jwt_token")
		if err == nil && cookie != "" {
			tokenString = cookie
		} else {
			// 2. Si no hay cookie, intentar del header (para compatibilidad con API)
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autenticación requerido"})
				c.Abort()
				return
			}

			// Extraer el token del header "Bearer <token>"
			if _, err := fmt.Sscanf(authHeader, "Bearer %s", &tokenString); err != nil || tokenString == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
				c.Abort()
				return
			}
		}

		// Si llegamos aquí, deberíamos tener un token. Si no, es un error.
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No se pudo encontrar el token"})
			c.Abort()
			return
		}

		// Validar el token
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido: " + err.Error()})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.RolID)
		c.Next()
	}
}
