package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

// BuscarPacientes permite buscar pacientes por apellido, nombre o nro_credencial (DNI)
// @Summary      Buscar pacientes
// @Description  Busca pacientes por apellido, nombre o DNI
// @Tags         pacientes
// @Produce      json
// @Param        apellido        query     string  false  "Apellido del paciente"
// @Param        nombre          query     string  false  "Nombre del paciente"
// @Param        nro_credencial  query     string  false  "DNI o número de credencial"
// @Success      200  {object}  map[string]interface{}
// @Router       /api/v1/pacientes/buscar [get]
func (h *PacienteHandler) BuscarPacientes(c *gin.Context) {
	apellido := strings.TrimSpace(c.Query("apellido"))
	nombre := strings.TrimSpace(c.Query("nombre"))
	dni := strings.TrimSpace(c.Query("nro_credencial"))
	if dni == "" {
		dni = strings.TrimSpace(c.Query("dni"))
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `SELECT id, nombre, apellido, fecha_nacimiento, dni, genero, calle, numero, localidad, codigo_postal, telefono, nro_credencial, obra_social, condicion_iva, plan, creado_por_usuario, consultorio_id, creado_en FROM pacientes WHERE 1=1`
	args := []interface{}{}
	idx := 1
	if apellido != "" {
		query += " AND apellido ILIKE $" + itoa(idx)
		args = append(args, "%"+apellido+"%")
		idx++
	}
	if nombre != "" {
		query += " AND nombre ILIKE $" + itoa(idx)
		args = append(args, "%"+nombre+"%")
		idx++
	}
	if dni != "" {
		query += " AND (nro_credencial ILIKE $" + itoa(idx) + " OR dni ILIKE $" + itoa(idx) + ")"
		args = append(args, "%"+dni+"%")
		idx++
	}
	query += " ORDER BY creado_en DESC"

	rows, err := h.pool.Query(ctx, query, args...)
	if err != nil {
		h.logger.Error("Error al buscar pacientes", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno del servidor"})
		return
	}
	defer rows.Close()

	pacientes := make([]Paciente, 0)
	for rows.Next() {
		var (
			id                                            uuid.UUID
			nombre, apellido                              string
			fechaNacimiento, creadoEn                     time.Time
			dniCol, genero, calle, numero, localidad, cp, tel *string
			nroCredencial, obraSocial, condicionIVA, plan *string
			creadoPorUsuario, consultorioID               uuid.NullUUID
		)
		err := rows.Scan(
			&id, &nombre, &apellido, &fechaNacimiento, &dniCol, &genero, &calle, &numero, &localidad, &cp, &tel,
			&nroCredencial, &obraSocial, &condicionIVA, &plan, &creadoPorUsuario, &consultorioID, &creadoEn,
		)
		if err != nil {
			h.logger.Error("Error al escanear paciente", zap.Error(err))
			continue
		}
		var creadoPorUserStr *string
		if creadoPorUsuario.Valid {
			s := creadoPorUsuario.UUID.String()
			creadoPorUserStr = &s
		}
		var consultorioIDStr *string
		if consultorioID.Valid {
			s := consultorioID.UUID.String()
			consultorioIDStr = &s
		}
		p := Paciente{
			ID:               id.String(),
			Nombre:           nombre,
			Apellido:         apellido,
			FechaNacimiento:  fechaNacimiento.Format("2006-01-02"),
			DNI:              dniCol,
			Genero:           genero,
			Calle:            calle,
			Numero:           numero,
			Localidad:        localidad,
			CodigoPostal:     cp,
			Telefono:         tel,
			NroCredencial:    nroCredencial,
			ObraSocial:       obraSocial,
			CondicionIVA:     condicionIVA,
			Plan:             plan,
			CreadoPorUsuario: creadoPorUserStr,
			ConsultorioID:    consultorioIDStr,
			CreadoEn:         creadoEn.Format(time.RFC3339),
		}
		pacientes = append(pacientes, p)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "success",
		"pacientes": pacientes,
		"total":     len(pacientes),
	})
}

// itoa convierte int a string (para armar los $1, $2... en la query)

func itoa(i int) string {
	return fmt.Sprintf("%d", i)
}

func (h *PacienteHandler) CreatePaciente(c *gin.Context) {
	var input Paciente
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	h.logger.Info("Datos recibidos para crear paciente", zap.Any("input", input))
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	id := uuid.New().String()
	creadoEn := time.Now().UTC().Format(time.RFC3339)

	query := `
	       INSERT INTO pacientes (
		       id, nombre, apellido, fecha_nacimiento, dni, genero, calle, numero, localidad, codigo_postal, telefono, nro_credencial, obra_social, condicion_iva, plan, creado_por_usuario, consultorio_id, creado_en
	       )
	       VALUES (
		       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
	       )
       `
	// Asignar null a creado_por_usuario y consultorio_id (o puedes obtenerlos del contexto si tienes auth)
	var creadoPorUsuario interface{} = nil
	var consultorioID interface{} = nil
	// Parsear fecha_nacimiento desde string (acepta DD/MM/YYYY o YYYY-MM-DD)
	var fechaNacimiento time.Time
	var parseErr error
	if input.FechaNacimiento != "" {
		fechaNacimiento, parseErr = time.Parse("02/01/2006", input.FechaNacimiento)
		if parseErr != nil {
			fechaNacimiento, parseErr = time.Parse("2006-01-02", input.FechaNacimiento)
		}
		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de fecha_nacimiento inválido. Usa DD/MM/YYYY o YYYY-MM-DD"})
			return
		}
	}
	_, err := h.pool.Exec(ctx, query,
		id,
		input.Nombre,
		input.Apellido,
		fechaNacimiento,
		input.DNI,
		input.Genero,
		input.Calle,
		input.Numero,
		input.Localidad,
		input.CodigoPostal,
		input.Telefono,
		input.NroCredencial,
		input.ObraSocial,
		input.CondicionIVA,
		input.Plan,
		creadoPorUsuario,
		consultorioID,
		creadoEn,
	)
	if err != nil {
		h.logger.Error("Error al crear paciente", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo crear el paciente", "detalle": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Paciente creado exitosamente",
		"id":      id,
	})
}

// UpdatePaciente godoc
// @Summary      Actualizar paciente
// @Description  Actualiza los datos de un paciente existente
// @Tags         pacientes
// @Accept       json
// @Produce      json
// @Param        id        path     string  true  "ID del paciente"
// @Param        paciente  body     object  true  "Datos del paciente"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /api/v1/pacientes/{id} [put]
func (h *PacienteHandler) UpdatePaciente(c *gin.Context) {
	id := c.Param("id")
	var input Paciente
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var fechaNacimiento time.Time
	if input.FechaNacimiento != "" {
		var parseErr error
		fechaNacimiento, parseErr = time.Parse("2006-01-02", input.FechaNacimiento)
		if parseErr != nil {
			fechaNacimiento, _ = time.Parse("02/01/2006", input.FechaNacimiento)
		}
	}

	query := `
	      UPDATE pacientes SET 
	          nombre=$1, apellido=$2, fecha_nacimiento=$3, dni=$4, nro_credencial=$5, 
	          obra_social=$6, condicion_iva=$7, plan=$8, genero=$9, calle=$10, 
	          numero=$11, localidad=$12, codigo_postal=$13, telefono=$14
	      WHERE id=$15
      `
	res, err := h.pool.Exec(ctx, query,
		input.Nombre,
		input.Apellido,
		fechaNacimiento,
		input.DNI,
		input.NroCredencial,
		input.ObraSocial,
		input.CondicionIVA,
		input.Plan,
		input.Genero,
		input.Calle,
		input.Numero,
		input.Localidad,
		input.CodigoPostal,
		input.Telefono,
		id,
	)
	if err != nil {
		h.logger.Error("Error al actualizar paciente", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo actualizar el paciente", "detalle": err.Error()})
		return
	}
	if res.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paciente no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Paciente actualizado exitosamente"})
}

// DeletePaciente godoc
// @Summary      Eliminar paciente
// @Description  Elimina un paciente por ID
// @Tags         pacientes
// @Produce      json
// @Param        id   path      string  true  "ID del paciente"
// @Success      200  {object}  map[string]interface{}
// @Failure      404  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]interface{}
// @Router       /api/v1/pacientes/{id} [delete]
func (h *PacienteHandler) DeletePaciente(c *gin.Context) {
	id := c.Param("id")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `DELETE FROM pacientes WHERE id=$1`
	res, err := h.pool.Exec(ctx, query, id)
	if err != nil {
		h.logger.Error("Error al eliminar paciente", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo eliminar el paciente", "detalle": err.Error()})
		return
	}
	if res.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paciente no encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Paciente eliminado exitosamente"})
}

// PoolTX define los métodos mínimos que el handler de pacientes necesita de un pool
type PoolTX interface {
	Exec(ctx context.Context, sql string, args ...interface{}) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row
	Ping(ctx context.Context) error
	Stat() *pgxpool.Stat
}

// PacienteHandler maneja las operaciones relacionadas con pacientes
type PacienteHandler struct {
	pool   PoolTX
	logger *zap.Logger
}

// NewPacienteHandler crea una nueva instancia del handler de pacientes
func NewPacienteHandler(pool PoolTX, logger *zap.Logger) *PacienteHandler {
	return &PacienteHandler{
		pool:   pool,
		logger: logger,
	}
}

// Paciente representa la estructura de la tabla 'pacientes' normalizada
type Paciente struct {
	ID               string  `json:"id" db:"id"`
	Nombre           string  `json:"nombre" db:"nombre"`
	Apellido         string  `json:"apellido" db:"apellido"`
	FechaNacimiento  string  `json:"fecha_nacimiento" db:"fecha_nacimiento"`
	DNI              *string `json:"dni,omitempty" db:"dni"`
	NroCredencial    *string `json:"nro_credencial,omitempty" db:"nro_credencial"`
	ObraSocial       *string `json:"obra_social,omitempty" db:"obra_social"`
	CondicionIVA     *string `json:"condicion_iva,omitempty" db:"condicion_iva"`
	Plan             *string `json:"plan,omitempty" db:"plan"`
	CreadoPorUsuario *string `json:"creado_por_usuario,omitempty" db:"creado_por_usuario"`
	ConsultorioID    *string `json:"consultorio_id,omitempty" db:"consultorio_id"`
	CreadoEn         string  `json:"creado_en" db:"creado_en"`
	Genero           *string `json:"genero,omitempty" db:"genero"`
	Calle            *string `json:"calle,omitempty" db:"calle"`
	Numero           *string `json:"numero,omitempty" db:"numero"`
	Localidad        *string `json:"localidad,omitempty" db:"localidad"`
	CodigoPostal     *string `json:"codigo_postal,omitempty" db:"codigo_postal"`
	Telefono         *string `json:"telefono,omitempty" db:"telefono"`
}

// GetPacientes godoc
// @Summary      Obtener lista de pacientes
// @Description  Obtiene todos los pacientes desde Supabase
// @Tags         pacientes
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /api/v1/pacientes [get]
func (h *PacienteHandler) GetPacientes(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
	       SELECT
		       id, nombre, apellido, fecha_nacimiento, dni, genero, calle, numero, localidad, codigo_postal, telefono, nro_credencial, obra_social, condicion_iva, plan, creado_por_usuario, consultorio_id, creado_en
	       FROM pacientes
	       ORDER BY creado_en DESC
       `

	rows, err := h.pool.Query(ctx, query)
	if err != nil {
		h.logger.Error("Error al consultar pacientes", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error interno del servidor",
		})
		return
	}
	defer rows.Close()

	pacientes := make([]Paciente, 0)
	for rows.Next() {
		var (
			id                                            uuid.UUID
			nombre, apellido                              string
			fechaNacimiento, creadoEn                     time.Time
			dniCol, genero, calle, numero, localidad, cp, tel *string
			nroCredencial, obraSocial, condicionIVA, plan *string
			creadoPorUsuario, consultorioID               uuid.NullUUID
		)
		err := rows.Scan(
			&id, &nombre, &apellido, &fechaNacimiento, &dniCol, &genero, &calle, &numero, &localidad, &cp, &tel,
			&nroCredencial, &obraSocial, &condicionIVA, &plan, &creadoPorUsuario, &consultorioID, &creadoEn,
		)
		if err != nil {
			h.logger.Error("Error al escanear paciente", zap.Error(err))
			continue
		}
		var creadoPorUserStr *string
		if creadoPorUsuario.Valid {
			s := creadoPorUsuario.UUID.String()
			creadoPorUserStr = &s
		}
		var consultorioIDStr *string
		if consultorioID.Valid {
			s := consultorioID.UUID.String()
			consultorioIDStr = &s
		}
		p := Paciente{
			ID:               id.String(),
			Nombre:           nombre,
			Apellido:         apellido,
			FechaNacimiento:  fechaNacimiento.Format("2006-01-02"),
			DNI:              dniCol,
			Genero:           genero,
			Calle:            calle,
			Numero:           numero,
			Localidad:        localidad,
			CodigoPostal:     cp,
			Telefono:         tel,
			NroCredencial:    nroCredencial,
			ObraSocial:       obraSocial,
			CondicionIVA:     condicionIVA,
			Plan:             plan,
			CreadoPorUsuario: creadoPorUserStr,
			ConsultorioID:    consultorioIDStr,
			CreadoEn:         creadoEn.Format(time.RFC3339),
		}
		pacientes = append(pacientes, p)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "success",
		"pacientes": pacientes,
		"total":     len(pacientes),
	})
}

// Función auxiliar para convertir string a *string
func ptrString(s string) *string {
	if s == "00000000-0000-0000-0000-000000000000" || s == "" {
		return nil
	}
	return &s
}

// GetPaciente godoc
// @Summary      Obtener paciente por ID
// @Description  Obtiene un paciente específico por su ID
// @Tags         pacientes
// @Produce      json
// @Param        id   path      int  true  "Patient ID"
// @Success      200  {object}  map[string]interface{}
// @Router       /api/v1/pacientes/{id} [get]
func (h *PacienteHandler) GetPaciente(c *gin.Context) {
	idParam := c.Param("id")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
	       SELECT
		       id, nombre, apellido, fecha_nacimiento, dni, genero, calle, numero, localidad, codigo_postal, telefono, nro_credencial, obra_social, condicion_iva, plan, creado_por_usuario, consultorio_id, creado_en
	       FROM pacientes
	       WHERE id = $1
       `

	var (
		id                                            uuid.UUID
		nombre, apellido                              string
		fechaNacimiento, creadoEn                     time.Time
		dniCol, genero, calle, numero, localidad, cp, tel *string
		nroCredencial, obraSocial, condicionIVA, plan *string
		creadoPorUsuario, consultorioID               uuid.NullUUID
	)
	err := h.pool.QueryRow(ctx, query, idParam).Scan(
		&id, &nombre, &apellido, &fechaNacimiento, &dniCol, &genero, &calle, &numero, &localidad, &cp, &tel,
		&nroCredencial, &obraSocial, &condicionIVA, &plan, &creadoPorUsuario, &consultorioID, &creadoEn,
	)
	if err != nil {
		h.logger.Error("Error al consultar paciente", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Paciente no encontrado",
		})
		return
	}
	var creadoPorUserStr *string
	if creadoPorUsuario.Valid {
		s := creadoPorUsuario.UUID.String()
		creadoPorUserStr = &s
	}
	var consultorioIDStr *string
	if consultorioID.Valid {
		s := consultorioID.UUID.String()
		consultorioIDStr = &s
	}
	p := Paciente{
		ID:               id.String(),
		Nombre:           nombre,
		Apellido:         apellido,
		FechaNacimiento:  fechaNacimiento.Format("2006-01-02"),
		DNI:              dniCol,
		Genero:           genero,
		Calle:            calle,
		Numero:           numero,
		Localidad:        localidad,
		CodigoPostal:     cp,
		Telefono:         tel,
		NroCredencial:    nroCredencial,
		ObraSocial:       obraSocial,
		CondicionIVA:     condicionIVA,
		Plan:             plan,
		CreadoPorUsuario: creadoPorUserStr,
		ConsultorioID:    consultorioIDStr,
		CreadoEn:         creadoEn.Format(time.RFC3339),
	}
	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"paciente": p,
	})
}

// TestSupabaseConnection godoc
// @Summary      Probar conexión con Supabase
// @Description  Prueba la conexión con las tablas existentes en Supabase
// @Tags         test
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /api/v1/test/supabase [get]
func (h *PacienteHandler) TestSupabaseConnection(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Probar conectividad básica
	if err := h.pool.Ping(ctx); err != nil {
		h.logger.Error("Error de ping a Supabase", zap.Error(err))
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "error",
			"error":  "No se puede conectar a Supabase",
		})
		return
	}

	// Contar registros en todas las tablas de Supabase (nombres exactos)
	tables := []string{
		"auditorias",
		"consultorios",
		"datos_personales",
		"historia_clinica_version", // Corregido: singular
		"historias_clinicas",
		"pacientes",
		"permisos",
		"recetas_medicas",
		"rol_permiso",
		"roles",
		"turnos",
		"usuarios",
	}
	counts := make(map[string]int)
	tableDetails := make(map[string]map[string]interface{})

	for _, table := range tables {
		var count int
		query := "SELECT COUNT(*) FROM " + table
		err := h.pool.QueryRow(ctx, query).Scan(&count)
		if err != nil {
			h.logger.Warn("Error al consultar tabla", zap.String("table", table), zap.Error(err))
			counts[table] = -1
			tableDetails[table] = map[string]interface{}{
				"count": -1,
				"error": err.Error(),
			}
		} else {
			counts[table] = count
			tableDetails[table] = map[string]interface{}{
				"count":  count,
				"status": "accessible",
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":           "success",
		"database":         "connected",
		"supabase_project": "beautiful-health-db",
		"tables_count":     counts,
		"table_details":    tableDetails,
		"total_tables":     len(tables),
		"connection_pool":  h.pool.Stat(),
		"timestamp":        time.Now(),
	})
}

// InspectTables godoc
// @Summary      Inspeccionar estructura de tablas
// @Description  Obtiene la estructura de las tablas para verificar columnas
// @Tags         test
// @Produce      json
// @Param        table   query     string  false  "Nombre de la tabla a inspeccionar (default: pacientes)"
// @Success      200  {object}  map[string]interface{}
// @Router       /api/v1/inspect/tables [get]
func (h *PacienteHandler) InspectTables(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Obtener tabla a inspeccionar desde query parameter
	tableName := c.DefaultQuery("table", "pacientes")

	// Lista de tablas permitidas por seguridad (nombres exactos de Supabase)
	allowedTables := map[string]bool{
		"auditorias":               true,
		"consultorios":             true,
		"datos_personales":         true,
		"historia_clinica_version": true, // Corregido: singular
		"historias_clinicas":       true,
		"pacientes":                true,
		"permisos":                 true,
		"recetas_medicas":          true,
		"rol_permiso":              true,
		"roles":                    true,
		"turnos":                   true,
		"usuarios":                 true,
	}

	if !allowedTables[tableName] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Tabla no permitida",
			"allowed_tables": []string{
				"auditorias", "consultorios", "datos_personales",
				"historia_clinica_version", "historias_clinicas", "pacientes",
				"permisos", "recetas_medicas", "rol_permiso", "roles", "turnos", "usuarios",
			},
		})
		return
	}

	// Obtener columnas de la tabla especificada
	query := `
		SELECT column_name, data_type, is_nullable, column_default
		FROM information_schema.columns
		WHERE table_name = $1
		ORDER BY ordinal_position
	`

	rows, err := h.pool.Query(ctx, query, tableName)
	if err != nil {
		h.logger.Error("Error al consultar estructura de tabla",
			zap.String("table", tableName), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error interno del servidor",
			"table": tableName,
		})
		return
	}
	defer rows.Close()

	var columns []map[string]interface{}
	for rows.Next() {
		var columnName, dataType, isNullable string
		var columnDefault *string

		err := rows.Scan(&columnName, &dataType, &isNullable, &columnDefault)
		if err != nil {
			h.logger.Error("Error al escanear columna", zap.Error(err))
			continue
		}

		column := map[string]interface{}{
			"name":     columnName,
			"type":     dataType,
			"nullable": isNullable == "YES",
		}
		if columnDefault != nil {
			column["default"] = *columnDefault
		}
		columns = append(columns, column)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"table":   tableName,
		"columns": columns,
		"count":   len(columns),
	})
}

// ConnectAllTables godoc
// @Summary      Conectar y verificar todas las tablas
// @Description  Conecta con todas las tablas de Supabase y obtiene un resumen completo
// @Tags         test
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /api/v1/connect/all-tables [get]
func (h *PacienteHandler) ConnectAllTables(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Lista completa de tablas en Supabase (nombres exactos)
	tables := []string{
		"auditorias",
		"consultorios",
		"datos_personales",
		"historia_clinica_version", // Corregido: singular, no plural
		"historias_clinicas",
		"pacientes",
		"permisos",
		"recetas_medicas",
		"rol_permiso",
		"roles",
		"turnos",
		"usuarios",
	}

	allTablesData := make(map[string]interface{})
	successfulConnections := 0
	failedConnections := 0

	for _, tableName := range tables {
		tableData := make(map[string]interface{})

		// 1. Contar registros
		var count int
		countQuery := "SELECT COUNT(*) FROM " + tableName
		err := h.pool.QueryRow(ctx, countQuery).Scan(&count)
		if err != nil {
			h.logger.Warn("Error al consultar tabla",
				zap.String("table", tableName), zap.Error(err))
			tableData["status"] = "error"
			tableData["error"] = err.Error()
			tableData["count"] = -1
			failedConnections++
		} else {
			tableData["status"] = "connected"
			tableData["count"] = count
			successfulConnections++

			// 2. Obtener estructura de tabla (si la conexión fue exitosa)
			columnsQuery := `
				SELECT column_name, data_type, is_nullable, column_default
				FROM information_schema.columns
				WHERE table_name = $1
				ORDER BY ordinal_position
			`

			rows, err := h.pool.Query(ctx, columnsQuery, tableName)
			if err != nil {
				h.logger.Warn("Error al consultar estructura",
					zap.String("table", tableName), zap.Error(err))
				tableData["columns_error"] = err.Error()
			} else {
				var columns []map[string]interface{}
				for rows.Next() {
					var columnName, dataType, isNullable string
					var columnDefault *string

					err := rows.Scan(&columnName, &dataType, &isNullable, &columnDefault)
					if err != nil {
						continue
					}

					column := map[string]interface{}{
						"name":     columnName,
						"type":     dataType,
						"nullable": isNullable == "YES",
					}
					if columnDefault != nil {
						column["default"] = *columnDefault
					}
					columns = append(columns, column)
				}
				rows.Close()
				tableData["columns"] = columns
				tableData["columns_count"] = len(columns)
			}

			// 3. Obtener muestra de datos (primeros 3 registros si existen)
			if count > 0 {
				sampleQuery := "SELECT * FROM " + tableName + " LIMIT 3"
				sampleRows, err := h.pool.Query(ctx, sampleQuery)
				if err != nil {
					tableData["sample_error"] = err.Error()
				} else {
					// Convertir a slice de maps genérico
					var samples []map[string]interface{}
					for sampleRows.Next() {
						// Obtener nombres de columnas
						fieldDescriptions := sampleRows.FieldDescriptions()
						columnNames := make([]string, len(fieldDescriptions))
						for i, desc := range fieldDescriptions {
							columnNames[i] = string(desc.Name)
						}

						// Crear slice de interfaces para escanear
						values := make([]interface{}, len(columnNames))
						valuePtrs := make([]interface{}, len(columnNames))
						for i := range values {
							valuePtrs[i] = &values[i]
						}

						if err := sampleRows.Scan(valuePtrs...); err == nil {
							row := make(map[string]interface{})
							for i, colName := range columnNames {
								row[colName] = values[i]
							}
							samples = append(samples, row)
						}
					}
					sampleRows.Close()
					tableData["sample_data"] = samples
					tableData["sample_count"] = len(samples)
				}
			}
		}

		allTablesData[tableName] = tableData
	}

	// Resumen final
	summary := map[string]interface{}{
		"status":                 "success",
		"total_tables":           len(tables),
		"successful_connections": successfulConnections,
		"failed_connections":     failedConnections,
		"connection_rate":        float64(successfulConnections) / float64(len(tables)) * 100,
		"database":               "Supabase PostgreSQL",
		"project":                "beautiful-health-db",
		"timestamp":              time.Now(),
		"pool_stats":             h.pool.Stat(),
	}

	c.JSON(http.StatusOK, gin.H{
		"summary": summary,
		"tables":  allTablesData,
	})
}
