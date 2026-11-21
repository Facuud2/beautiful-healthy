package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/Lunita-Code/beautiful-health/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// GET /api/v1/pacientes/search?q=...
func (h *ConsultasHandler) SearchPacientes(c *gin.Context) {
	pool, ok := c.MustGet("db").(*pgxpool.Pool)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo obtener la conexión a la base de datos"})
		return
	}

	search := c.Query("q")
	if search == "" {
		search = c.Query("search")
	}
	if len(search) < 1 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	query := `SELECT id, nombre, apellido, dni FROM pacientes WHERE 
		nombre ILIKE '%' || $1 || '%' OR apellido ILIKE '%' || $1 || '%' OR dni ILIKE '%' || $1 || '%' 
		ORDER BY nombre LIMIT 10`

	rows, err := pool.Query(c, query, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error consultando pacientes", "details": err.Error()})
		return
	}
	defer rows.Close()

	pacientes := make([]map[string]interface{}, 0)
	for rows.Next() {
		var id, nombre, apellido, dni sql.NullString
		if err := rows.Scan(&id, &nombre, &apellido, &dni); err != nil {
			continue
		}

		// Convertir NULL a cadena vacía para la respuesta
		idStr := ""
		if id.Valid {
			idStr = id.String
		}
		nombreStr := ""
		if nombre.Valid {
			nombreStr = nombre.String
		}
		apellidoStr := ""
		if apellido.Valid {
			apellidoStr = apellido.String
		}
		dniStr := ""
		if dni.Valid {
			dniStr = dni.String
		}

		pacientes = append(pacientes, map[string]interface{}{
			"id":       idStr,
			"nombre":   nombreStr,
			"apellido": apellidoStr,
			"dni":      dniStr,
		})
	}
	c.JSON(http.StatusOK, pacientes)
}

// ConsultasHandler maneja los endpoints relacionados con consultas.
type ConsultasHandler struct{}

// PUT /api/v1/consultas/:id
func (h *ConsultasHandler) UpdateConsulta(c *gin.Context) {
	id := c.Param("id")
	var body struct {
		Diagnostico string `json:"diagnostico"`
		Tratamiento string `json:"tratamiento"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	pool, ok := c.MustGet("db").(*pgxpool.Pool)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo obtener la conexión a la base de datos"})
		return
	}

	// Actualizar la última versión de la consulta
	update := `UPDATE historia_clinica_version SET diagnostico = $1, tratamiento = $2, modificado_en = NOW()
			   WHERE historia_clinica_id = $3 AND modificado_en = (
				   SELECT MAX(modificado_en) FROM historia_clinica_version WHERE historia_clinica_id = $3
			   )`
	_, err := pool.Exec(c, update, body.Diagnostico, body.Tratamiento, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando la consulta", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Consulta actualizada correctamente"})
}

// GET /api/v1/consultas
func (h *ConsultasHandler) GetConsultas(c *gin.Context) {
	// Obtener pool de la base de datos desde el contexto
	pool, ok := c.MustGet("db").(*pgxpool.Pool)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo obtener la conexión a la base de datos"})
		return
	}

	query := `
	SELECT
		hc.id,
		hc.usuario_id,
		u.nombre AS medico_nombre,
		u.apellido AS medico_apellido,
		hc.paciente_id,
		p.nombre AS paciente_nombre,
		p.apellido AS paciente_apellido,
		p.dni,
		hc.fecha_consulta,
		v.motivo_consulta,
		v.diagnostico,
		v.tratamiento,
		hc.fecha_consulta AS creado_en
	FROM historias_clinicas hc
	JOIN historia_clinica_version v ON v.historia_clinica_id = hc.id
	JOIN usuarios u ON u.id = hc.usuario_id
	JOIN pacientes p ON p.id = hc.paciente_id
	WHERE v.modificado_en = (
		SELECT MAX(v2.modificado_en)
		FROM historia_clinica_version v2
		WHERE v2.historia_clinica_id = hc.id
	)
	ORDER BY hc.fecha_consulta DESC
	`

	rows, err := pool.Query(c, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error consultando la base de datos", "details": err.Error()})
		return
	}
	defer rows.Close()

	consultas := []models.Consulta{}
	for rows.Next() {
		var consulta models.Consulta
		var medicoApellido, pacienteApellido string
		var diagnostico, tratamiento string
		var motivo string
		if err := rows.Scan(
			&consulta.ID,
			&consulta.MedicoID,
			&consulta.MedicoNombre,
			&medicoApellido,
			&consulta.PacienteID,
			&consulta.PacienteNombre,
			&pacienteApellido,
			&consulta.DNI,
			&consulta.Fecha,
			&motivo,
			&diagnostico,
			&tratamiento,
			&consulta.CreadoEn,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error leyendo datos", "details": err.Error()})
			return
		}
		consulta.MedicoApellido = medicoApellido
		consulta.PacienteApellido = pacienteApellido
		consulta.Motivo = motivo
		consulta.Diagnostico = diagnostico
		consulta.Tratamiento = tratamiento
		// Inferir estado: si diagnóstico o tratamiento están vacíos, es pendiente
		if diagnostico == "" && tratamiento == "" {
			consulta.Estado = "pendiente"
		} else {
			consulta.Estado = "resuelta"
		}
		consultas = append(consultas, consulta)
	}
	c.JSON(http.StatusOK, consultas)
}

// POST /api/v1/consultas
func (h *ConsultasHandler) CreateConsulta(c *gin.Context) {
	var consulta models.Consulta
	if err := c.ShouldBindJSON(&consulta); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}
	consulta.ID = uuid.New()
	consulta.CreadoEn = time.Now()

	// Obtener pool de la base de datos desde el contexto
	pool, ok := c.MustGet("db").(*pgxpool.Pool)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo obtener la conexión a la base de datos"})
		return
	}

	// Obtener el ID del médico desde el JWT/session
	medicoID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No se pudo obtener el usuario autenticado"})
		return
	}
	consulta.MedicoID, _ = uuid.Parse(medicoID.(string))

	// Insertar en historias_clinicas
	insertHC := `INSERT INTO historias_clinicas (id, usuario_id, paciente_id, fecha_consulta) VALUES ($1, $2, $3, $4)`
	_, err := pool.Exec(c, insertHC, consulta.ID, consulta.MedicoID, consulta.PacienteID, consulta.Fecha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error insertando en historias_clinicas", "details": err.Error()})
		return
	}

	// Insertar en historia_clinica_version
	insertVer := `INSERT INTO historia_clinica_version (historia_clinica_id, usuario_id, motivo_consulta, diagnostico, tratamiento, modificado_en) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = pool.Exec(c, insertVer, consulta.ID, consulta.MedicoID, consulta.Motivo, consulta.Diagnostico, consulta.Tratamiento, consulta.CreadoEn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error insertando en historia_clinica_version", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, consulta)
}

// GET /api/v1/consultas/:id
func (h *ConsultasHandler) GetConsultaByID(c *gin.Context) {
	id := c.Param("id")
	// TODO: Buscar en la base de datos
	c.JSON(http.StatusOK, gin.H{"id": id, "detalle": "Consulta mock"})
}
