package models

import (
	"time"

	"github.com/google/uuid"
)

// Consulta representa una consulta médica
// Puede ser extendido según necesidades del MVP
// Estado: "pendiente" o "resuelta"
type Consulta struct {
	ID               uuid.UUID `json:"id" db:"id"`
	MedicoID         uuid.UUID `json:"medico_id" db:"medico_id"`
	MedicoNombre     string    `json:"medico_nombre" db:"medico_nombre"`
	MedicoApellido   string    `json:"medico_apellido" db:"medico_apellido"`
	PacienteID       uuid.UUID `json:"paciente_id" db:"paciente_id"`
	PacienteNombre   string    `json:"paciente_nombre" db:"paciente_nombre"`
	PacienteApellido string    `json:"paciente_apellido" db:"paciente_apellido"`
	DNI              string    `json:"dni" db:"dni"`
	Fecha            time.Time `json:"fecha" db:"fecha"`
	Motivo           string    `json:"motivo" db:"motivo"`
	Estado           string    `json:"estado" db:"estado"` // pendiente, resuelta
	CreadoEn         time.Time `json:"creado_en" db:"creado_en"`
	Diagnostico      string    `json:"diagnostico" db:"diagnostico"`
	Tratamiento      string    `json:"tratamiento" db:"tratamiento"`
}
