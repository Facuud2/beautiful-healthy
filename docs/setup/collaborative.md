# 🏥 Beautiful Health - Configuración de Desarrollo Colaborativo

## 🚀 Inicio Rápido

### Pre-requisitos
- Git
- Node.js (v18+), npm
- Go (1.20+)
- Acceso a Supabase (colaborativo)

### 📋 Configuración Inicial

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd beautiful-health
```

2. **Configurar variables de entorno:**
```bash
# El archivo .env ya está configurado para Supabase
# Verificar que la DATABASE_URL es correcta
cp .env.example .env
```

3. **Levantar los servicios de desarrollo (localmente):**

Backend (Go):
```bash
cd backend
go run cmd/server/main.go
```

Frontend (React):
```bash
cd frontend
npm ci
npm run dev
```

### 🔧 Desarrollo local

El proyecto puede ejecutarse localmente sin uso de contenedores. Usa las instrucciones anteriores para iniciar el backend y el frontend. El frontend está configurado para usar un proxy hacia el backend (Vite) usando `VITE_API_URL`.

### 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Swagger Docs**: http://localhost:8080/swagger/index.html

### 🗄️ Base de Datos (Supabase)

El proyecto está configurado para usar **Supabase** como base de datos compartida:

- **Ventajas del enfoque colaborativo:**
  - Todos los desarrolladores usan la misma base de datos
  - Esquema consistente entre todos los entornos
  - Datos compartidos para pruebas
  - Sin necesidad de configurar PostgreSQL local

- **Variables de conexión:**
  - `DATABASE_URL`: Configurada en `.env` 
  - Conectividad automática con SSL requerido
  - Pooling de conexiones habilitado

### � **Estado de Conectividad: 100% ✅**

**12/12 tablas conectadas exitosamente:**

| Tabla | Columnas | Registros | Estado | Descripción |
|-------|----------|-----------|--------|-------------|
| `auditorias` | 5 | 0 | ✅ | Logs de auditoría del sistema |
| `consultorios` | 2 | 0 | ✅ | Información de consultorios |
| `datos_personales` | 5 | 0 | ✅ | Datos personales encriptados |
| `historia_clinica_version` | 9 | 0 | ✅ | Versiones de historias clínicas |
| `historias_clinicas` | 4 | 0 | ✅ | Historias clínicas principales |
| `pacientes` | 10 | 0 | ✅ | Información de pacientes |
| `permisos` | 2 | 7 | ✅ | Sistema de permisos |
| `recetas_medicas` | 6 | 0 | ✅ | Recetas médicas digitales |
| `rol_permiso` | 2 | 0 | ✅ | Relación roles-permisos |
| `roles` | 2 | 3 | ✅ | Roles del sistema |
| `turnos` | 5 | 0 | ✅ | Sistema de turnos |
| `usuarios` | 8 | 0 | ✅ | Usuarios del sistema |

### 🔌 **API Endpoints Disponibles**

#### **Gestión de Pacientes**
```bash
# Listar todos los pacientes
GET http://localhost:8080/api/v1/pacientes

# Obtener paciente específico
GET http://localhost:8080/api/v1/pacientes/{id}
```

#### **Diagnóstico y Verificación**
```bash
# Verificar conectividad completa con Supabase
GET http://localhost:8080/api/v1/test/supabase

# Conectar y analizar todas las tablas
GET http://localhost:8080/api/v1/connect/all-tables

# Inspeccionar estructura de tabla específica
GET http://localhost:8080/api/v1/inspect/tables?table=pacientes
GET http://localhost:8080/api/v1/inspect/tables?table=usuarios
GET http://localhost:8080/api/v1/inspect/tables?table=historia_clinica_version
```

#### **Autenticación**
```bash
# Login
POST http://localhost:8080/login

# Endpoint protegido (requiere JWT)
GET http://localhost:8080/protected
```

### 🔄 Comandos de Desarrollo

Backend:
```bash
# Ejecutar servidor
cd backend && go run cmd/server/main.go

# Ver logs (si se ejecuta en background)
tail -f backend/server.log
```

Frontend:
```bash
cd frontend
npm ci
npm run dev
```

### 🔨 Watch Mode

El entorno local soporta hot reload y herramientas de reconstrucción:

- **Frontend**: Cambios en `src/` se sincronizan automáticamente con Vite
- **Backend**: Cambios en código Go activan reconstrucción automática (usa `air` si lo prefieres)

### � **Datos del Sistema**

#### **Roles Disponibles:**
- `medico` (ID: 1)
- `admin` (ID: 2) 
- `recepcionista` (ID: 3)

#### **Permisos Disponibles:**
- `ver_pacientes`
- `editar_pacientes`
- `ver_historia`
- `crear_turnos`
- `gestionar_usuarios`
- `auditar_sistema`
- `firmar_recetas`

### �🐛 Troubleshooting

#### Problemas de Conexión a Supabase
```bash
# Verificar variables de entorno (desde host)
env | grep DATABASE_URL

# Verificar conectividad
ping aws-1-us-east-2.pooler.supabase.com

# Verificar todas las tablas
curl -s http://localhost:6060/api/v1/connect/all-tables | jq '.summary'
```

#### Limpiar Artefactos Locales
```bash
# Eliminar binarios generados
rm -f backend/server

# Limpiar node_modules en frontend si es necesario
cd frontend && rm -rf node_modules && npm ci
```

#### Regenerar Contenedores (si aplica)
Si usabas contenedores, reemplaza esta sección con tus comandos de gestión de contenedores.

### 🧪 **Testing y Verificación**

#### Verificar Health Check
```bash
curl http://localhost:6060/health
# Respuesta esperada: {"db": true, "status": "ok"}
```

#### Verificar Conectividad Completa
```bash
curl -s http://localhost:6060/api/v1/connect/all-tables | jq '.summary'
# Debería mostrar: "connection_rate": 100, "successful_connections": 12
```

#### Inspeccionar Tabla Específica
```bash
# Ejemplo: inspeccionar tabla de usuarios
curl -s "http://localhost:8080/api/v1/inspect/tables?table=usuarios" | jq '.'
```

### 🤝 Trabajo en Equipo

- **Base de datos compartida**: Todos usan la misma instancia de Supabase
- **Variables de entorno**: Sincronizadas en el repositorio (sin credenciales sensibles)
- **Entorno compartido**: Configuración idéntica para todos los desarrolladores
- **Hot reload**: Desarrollo ágil con cambios en tiempo real
- **API consistente**: Endpoints documentados y probados

### 📝 Notas Importantes

1. **No modificar** la `DATABASE_URL` sin coordinación del equipo
2. **El archivo `.env` está en el repositorio** pero `.env.local` puede usarse para overrides locales
3. **JWT_SECRET_KEY** debe ser consistente entre todos los desarrolladores
4. **Ports 3000 y 8080** deben estar libres en tu máquina local
5. **Nombres de tablas**: Usar nombres exactos de Supabase (ej: `historia_clinica_version` no `historia_clinica_versiones`)

### 🏗️ **Arquitectura del Proyecto**

```
beautiful-health/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   ├── public/
├── backend/               # Go + Gin + pgx
│   ├── cmd/server/        # Main server
│   ├── internal/
│   │   ├── handlers/      # API handlers
│   │   ├── db/           # Database connection
│   │   ├── auth/         # JWT authentication
│   │   └── config/       # Configuration
├── .env                  # Environment variables
└── SETUP-COLABORATIVO.md # This file
```

### 📈 **Métricas de Rendimiento**

- **Conexión a DB**: < 30s timeout
- **API Response**: < 1s promedio
- **Pool de conexiones**: Optimizado para concurrencia
- **Hot reload**: < 3s para cambios en código
- **Conectividad**: 100% de tablas accesibles

### 🆘 Contacto

Si tienes problemas con la configuración, contacta al equipo de desarrollo o revisa los logs:

```bash
# Ver logs del backend
tail -f backend/server.log

# Ver logs del frontend  
# (ver la terminal donde ejecutaste `npm run dev`)
```
