# Instrucciones para usar Vault en desarrollo

Puedes usar una instancia local de Vault (siguiendo la documentación oficial) o una instancia remota/hosted. A continuación se describen las opciones comunes.

## 1. Usando Vault local (opcional)

Instala Vault en tu máquina o usa la imagen oficial siguiendo la guía de HashiCorp. Una vez levantado, exporta las variables de entorno:

```bash
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='root'
```

Accede a la UI en: http://localhost:8200 (si la instalaste localmente).

## 2. Acceder a la CLI de Vault

Si tienes Vault CLI instalado en tu máquina:

```bash
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='root'
vault status
```

## 3. Crear el secreto JWT_SECRET_KEY en Vault

Desde la UI:
	- Ve a "Secrets" > "Create secret"
	- Ruta: `secret/data/beautiful-health`
	- Clave: `JWT_SECRET_KEY`  Valor: `supersecreto123`

Desde la CLI:
```bash
vault kv put secret/beautiful-health JWT_SECRET_KEY=supersecreto123
```

## 4. Verificar el secreto desde la CLI

```bash
vault kv get secret/beautiful-health
```

## 6. Test automático en Go

Crea el archivo `backend/internal/config/vault_integration_test.go` con este contenido:

```go
//go:build integration
// +build integration

package config

import (
	"os"
	"testing"
)

func TestLoadSecretsFromVault(t *testing.T) {
	os.Setenv("VAULT_ADDR", "http://localhost:8200")
	os.Setenv("VAULT_TOKEN", "root")
	LoadSecretsFromVault()
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret != "supersecreto123" {
		t.Fatalf("Se esperaba JWT_SECRET_KEY=supersecreto123, pero se obtuvo: %s", secret)
	}
}
```

Ejecuta el test así:
```
cd backend
go test -tags=integration ./internal/config
```

---

Con esto tienes todo el flujo documentado y automatizado para desarrollo local con Vault.
