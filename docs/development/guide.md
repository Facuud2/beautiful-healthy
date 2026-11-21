# 🏥 Beautiful Health - Guía de Desarrollo Colaborativo

## ⚠️ Importante: Desarrollo local sin uso de contenedores
Este proyecto puede ejecutarse localmente sin uso de contenedores. Asegúrate de tener instalados Node.js, npm y Go.


## 🚀 Cómo ejecutar en modo desarrollo

### Desarrollo Local (Recomendado)
Usa estas instrucciones para ejecutar frontend y backend en tu máquina sin usar contenedores.
1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   El frontend estará disponible en: [http://localhost:3000](http://localhost:3000)

2. **Backend** (en otra terminal):
   ```bash
   cd backend
   go mod download
   go run cmd/server/main.go
   ```
   El backend estará disponible en: http://localhost:6060

3. **Configurar variables de entorno**:
   Asegúrate de que las variables en el archivo `.env` estén configuradas para conectar con Supabase.



### 1. Backend (Go)
1. **Instalar dependencias**:
   ```bash
   cd backend
   go mod download
   ```

3. **Configurar migraciones**:
    - Aplica las migraciones con `goose` si usas una base de datos local o apunta a Supabase:
       ```bash
       goose -dir migrations postgres "${DATABASE_URL}" up
       ```

3. **Ejecutar el servidor**:
   ```bash
   go run ./cmd/server/main.go
   ```
   El backend estará disponible en: [http://localhost:8080](http://localhost:8080).

4. **Verificar el estado del backend**:
   - Health Check: [http://localhost:8080/health](http://localhost:8080/health)
   - Swagger Docs: [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html)

---

### 2. Frontend (React + Vite)
1. **Instalar dependencias**:
   ```bash
   cd frontend
   npm install
   ```

2. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   El frontend estará disponible en: [http://localhost:3000](http://localhost:3000).

3. **Proxy API**:
   - El frontend está configurado para usar `VITE_API_URL` o el proxy dev de Vite para redirigir solicitudes al backend.

---

## 🛡️ Credenciales de acceso para desarrollo

Puedes usar cualquiera de las siguientes credenciales para acceder a la aplicación en entorno de desarrollo:

| Usuario      | Contraseña | Email                  |
|--------------|------------|------------------------|
| ugarcia      | password     | usuario@ejemplo.com    |
| ugimenez     | password   | usuario2@ejemplo.com   |
| Test User    | password   | test@lunitacode.com       |

**Importante:** El campo de login es el usuario (columna "Usuario"), NO el email.

### � Instrucciones para login
1. Ve a [http://localhost:3000/login](http://localhost:3000/login)
2. Ingresa el usuario y contraseña de la tabla anterior
3. Haz clic en "Iniciar sesión"
4. Si tienes problemas, asegúrate de que el backend y frontend estén corriendo y revisa la consola del navegador para más detalles.

### 3. Base de Datos (Supabase)
1. **Conexión a Supabase**:
   - Asegúrate de que las variables de entorno en [`.env`](.env ) estén configuradas correctamente:
     ```env
     DATABASE_URL=postgres://usuario:contraseña@host:puerto/dbname
     ```

2. **Verificar conectividad**:
   ```bash
   curl -s http://localhost:8080/api/v1/connect/all-tables | jq '.summary'
   ```
   Deberías obtener un resumen con `connection_rate: 100`.

---

## 🛠️ Herramientas de Desarrollo
### 🚦 Notificación al equipo sobre monitoreo

El endpoint de health check del backend está disponible en: http://localhost:6060/health

Los logs del backend pueden consultarse en `backend/server.log` si el servidor se ejecuta en background.

- **Testing**:
  - Backend:
    ```bash
    cd backend
    go test ./...
    ```
  - Frontend:
    ```bash
    npm test
    ```

---

## 📝 Notas Importantes
1. **Puertos**:
   - Backend: 8080
   - Frontend: 3000
2. **Variables de entorno**:
   - Asegúrate de que [`.env`](.env ) esté correctamente configurado.
3. **JWT**:
   - La clave `JWT_SECRET_KEY` ser consistente entre todos los desarrolladores.
4. **Base de datos compartida**:
   - Todos los desarrolladores usan la misma instancia de Supabase para mantener consistencia.

---

## 🚨 Solución de Problemas
1. **El backend no responde**:
    - Verifica el puerto 6060.
    - Revisa los logs:
       ```bash
       tail -f backend/server.log
       ```
    - Verifica el health check:
       ```bash
       curl http://localhost:6060/health
       ```

2. **El frontend no carga**:
   - Verifica el puerto 3000.
   - Revisa los logs en la terminal donde ejecutaste `npm run dev`.

3. **Problemas de conectividad con Supabase**:
    - Verifica las variables de entorno en tu shell:
       ```bash
       env | grep DATABASE_URL
       ```
    - Prueba la conectividad:
       ```bash
       curl http://localhost:6060/api/v1/test/supabase
       ```

---


## 🌐 URLs de Desarrollo
- **Frontend**: [http://localhost:3000](http://localhost:3000)
-- **Backend API**: [http://localhost:6060](http://localhost:6060)
-- **Health Check**: [http://localhost:6060/health](http://localhost:6060/health)
-- **Swagger Docs**: [http://localhost:6060/swagger/index.html](http://localhost:6060/swagger/index.html)

---

## 🚦 Verificación de CI/CD y Alertas (GitHub Actions)

### 1. Forzar un error controlado en CI/CD

Para comprobar que la integración y entrega continua detectan fallos y notifican correctamente:

1. Crea una rama de prueba desde `develop` o `main`:
   ```bash
   git checkout -b test/ci-fail
   ```
2. Edita cualquier archivo de código y agrega un error sintáctico o de test (por ejemplo, elimina un paréntesis o haz que un test falle a propósito).
3. Haz commit y push:
   ```bash
   git add .
   git commit -m "Forzando error para probar CI/CD"
   git push origin test/ci-fail
   ```
4. Abre un Pull Request si lo deseas.

### 2. Qué esperar en la alerta

Si el pipeline falla, se enviará una alerta automática al canal de Discord configurado, con el mensaje:

```
❌ Build falló
Repositorio: Lunita-Code/beautiful-health
Branch: test/ci-fail
Autor: <usuario>
Cobertura Backend: <valor>
Cobertura Frontend: <valor>
```

### 3. Confirmar que los tests pasan en la rama principal

Cada push a `main` y `develop` ejecuta los tests de backend y frontend automáticamente. Puedes ver el estado en la pestaña **Actions** de GitHub.

### 4. Documentar el proceso y resultados

Cuando termines la prueba, elimina la rama de prueba y deja constancia (en este archivo o en un issue) de la fecha y resultado de la verificación.

---

**Ejemplo de resultado esperado:**

- Se fuerza un error → el pipeline falla → llega alerta a Discord → se corrige el error → el pipeline pasa en develop/main.

---
