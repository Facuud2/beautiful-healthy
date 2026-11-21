# 🔌 Beautiful Health - Documentación de API Endpoints

## 📋 Información General

- **Base URL**: `http://localhost:8080`
- **Formato**: JSON
- **Autenticación**: JWT (donde se requiera)
- **Estado**: ✅ 100% conectividad con Supabase

## 🏥 Endpoints de Pacientes

### Listar Pacientes
```http
GET /api/v1/pacientes

**Respuesta:**
```json
{
  "status": "success",
  "pacientes": [
    {
      "id": "uuid",
      "nombre_apellido": "string",
      "fecha_nacimiento": "2023-01-01",
      "nro_credencial": "string",
      "obra_social": "string",
      "condicion_iva": "string",
      "plan": "string",
      "creado_por_usuario": "uuid",
      "consultorio_id": "uuid",
      "creado_en": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 0
```

### Obtener Paciente Específico
```http
GET /api/v1/pacientes/{id}
```

**Parámetros:**
- `id` (path): UUID del paciente

**Respuesta:**
```json
  "status": "success",
  "paciente": {
    "id": "uuid",
    "nombre_apellido": "string",
    "fecha_nacimiento": "2023-01-01",
    // ... resto de campos
  }
}
```

## 🔍 Endpoints de Diagnóstico

### Verificar Conectividad Supabase
```http
GET /api/v1/test/supabase
```

**Respuesta:**
```json
{
  "status": "success",
  "database": "connected",
  "supabase_project": "beautiful-health-db",
  "tables_count": {
    "auditorias": 0,
    "consultorios": 0,
    "datos_personales": 0,
    "historia_clinica_version": 0,
    "historias_clinicas": 0,
    "pacientes": 0,
    "permisos": 7,
    "recetas_medicas": 0,
    "rol_permiso": 0,
    "roles": 3,
    "turnos": 0,
    "usuarios": 0
  },
  "table_details": {},
  "total_tables": 12,
  "connection_pool": {},
  "timestamp": "2025-08-19T02:35:28Z"
}
```

### Conectar Todas las Tablas
```http
GET /api/v1/connect/all-tables
```

**Respuesta:**
```json
{
  "summary": {
    "status": "success",
    "total_tables": 12,
    "successful_connections": 12,
    "failed_connections": 0,
    "connection_rate": 100.0,
    "database": "Supabase PostgreSQL",
    "project": "beautiful-health-db",
    "timestamp": "2025-08-19T02:35:28Z",
    "pool_stats": {}
  },
  "tables": {
    "auditorias": {
      "status": "connected",
      "count": 0,
      "columns": [...],
      "columns_count": 5
    },
    "pacientes": {
      "status": "connected", 
      "count": 0,
      "columns": [...],
      "columns_count": 10
    }
    // ... resto de tablas
  }
}
```

### Inspeccionar Tabla Específica
```http
GET /api/v1/inspect/tables?table={tableName}
```

**Parámetros:**
- `table` (query): Nombre de la tabla (default: pacientes)

- `auditorias`
- `consultorios`
```json
{
  "status": "success",
  "table": "pacientes",
  "columns": [
    {
      "name": "id",
      "type": "uuid",
      "nullable": false,
      "default": "uuid_generate_v4()"
    },
    {
      "name": "nombre_apellido",
      "type": "character varying",
      "nullable": false
    }
    // ... resto de columnas
  ],
  "count": 10
}
```

## 🔐 Endpoints de Autenticación

### Login
```http
POST /login
```

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

### Endpoint Protegido
```http
GET /protected
Authorization: Bearer {jwt_token}
```

## 🏠 Endpoints Generales

### Home
```http
GET /
```

**Respuesta:**
```json
{
  "message": "Bienvenido a la API de Beautiful Health",
  "status": "Backend Go funcionando correctamente",
  "service": "beautiful-health-backend",
  "version": "1.0.0",
  "database": "Supabase (PostgreSQL)"
}
```

### Health Check
```http
GET /health
```

**Respuesta:**
```json
{
  "db": true,
  "status": "ok"
}
```

### Documentación Swagger
```http
GET /swagger/index.html
```

## 📊 Estructura de las Tablas

### Tabla: `pacientes`
```sql
id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4()
nombre_apellido     VARCHAR NOT NULL
fecha_nacimiento    DATE NOT NULL
nro_credencial      VARCHAR
obra_social         VARCHAR
condicion_iva       VARCHAR
plan                VARCHAR
creado_por_usuario  UUID
consultorio_id      UUID
creado_en           TIMESTAMP DEFAULT now()
```

### Tabla: `usuarios`
```sql
id                UUID PRIMARY KEY DEFAULT uuid_generate_v4()
nombre            VARCHAR NOT NULL
email             VARCHAR NOT NULL
contraseña_hash   TEXT NOT NULL
rol_id            INTEGER
consultorio_id    UUID
activo            BOOLEAN DEFAULT true
creado_en         TIMESTAMP DEFAULT now()
```

### Tabla: `roles`
```sql
id       INTEGER PRIMARY KEY
nombre   VARCHAR NOT NULL
```

**Datos actuales:**
- `medico` (ID: 1)
- `admin` (ID: 2)
- `recepcionista` (ID: 3)

### Tabla: `permisos`
```sql
id       INTEGER PRIMARY KEY
nombre   VARCHAR NOT NULL
```

**Datos actuales:**
- `ver_pacientes`
- `editar_pacientes`
- `ver_historia`
- `crear_turnos`
- `gestionar_usuarios`
- `auditar_sistema`
- `firmar_recetas`

### Tabla: `historia_clinica_version`
```sql
id                UUID PRIMARY KEY DEFAULT uuid_generate_v4()
historia_id       UUID
motivo_consulta   TEXT
antecedentes      TEXT
examen_fisico     TEXT
diagnostico       TEXT
tratamiento       TEXT
usuarios_id       UUID
modificado_en     TIMESTAMP DEFAULT now()
```

## 🧪 Ejemplos de Uso

### Verificar que todo funciona
```bash
curl http://localhost:8080/health
```

### Obtener resumen completo del sistema
```bash
curl -s http://localhost:8080/api/v1/connect/all-tables | jq '.summary'
```

### Inspeccionar usuarios
```bash
curl -s "http://localhost:8080/api/v1/inspect/tables?table=usuarios" | jq '.columns'
```

### Inspeccionar pacientes
```bash
curl -s "http://localhost:8080/api/v1/inspect/tables?table=pacientes" | jq '.'
```

## 🚨 Códigos de Estado

- `200` - Éxito
- `400` - Error de validación o parámetros incorrectos
- `401` - No autorizado (JWT requerido)
- `404` - Recurso no encontrado
- `500` - Error interno del servidor
- `503` - Servicio no disponible (problema de conectividad)

## 📝 Notas para Desarrolladores

1. **UUID**: Todas las claves primarias principales usan UUID v4
2. **Timestamps**: Todos en formato ISO 8601 con timezone
3. **Paginación**: No implementada aún (pendiente)
4. **Filtros**: No implementados aún (pendiente)
5. **Validaciones**: Básicas implementadas, pendiente expandir
6. **Rate Limiting**: No implementado (pendiente para producción)

## 🔄 Próximas Implementaciones

- [ ] CRUD completo para todas las tablas
- [ ] Sistema de autenticación completo
- [ ] Paginación en endpoints de listado
- [ ] Filtros y búsqueda
- [ ] Validaciones exhaustivas
- [ ] Rate limiting
- [ ] Logging mejorado
- [ ] Tests automatizados
