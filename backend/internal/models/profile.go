package models

import "time"

// ProfileUpdateRequest representa la solicitud de actualización de perfil
type ProfileUpdateRequest struct {
	Nombre               string  `json:"nombre" binding:"required"`
	Apellido             string  `json:"apellido" binding:"required"`
	Email                string  `json:"email" binding:"required,email"`
	DNI                  *string `json:"dni,omitempty"`
	MatriculaProfesional *string `json:"matricula_profesional,omitempty"`
	Telefono             *string `json:"telefono,omitempty"`
}

// PasswordChangeRequest representa la solicitud de cambio de contraseña
type PasswordChangeRequest struct {
	CurrentPassword    string `json:"current_password" binding:"required"`
	NewPassword        string `json:"new_password" binding:"required,min=8"`
	ConfirmNewPassword string `json:"confirm_new_password" binding:"required"`
}

// ProfileResponse representa la respuesta del perfil del usuario con información del consultorio
type ProfileResponse struct {
	ID                   string    `json:"id"`
	Nombre               string    `json:"nombre"`
	Apellido             string    `json:"apellido"`
	Email                string    `json:"email"`
	DNI                  *string   `json:"dni,omitempty"`
	MatriculaProfesional *string   `json:"matricula_profesional,omitempty"`
	Telefono             *string   `json:"telefono,omitempty"`
	RolID                int       `json:"rol_id"`
	ConsultorioID        *string   `json:"consultorio_id,omitempty"`
	DireccionConsultorio *string   `json:"direccion_consultorio,omitempty"`
	Activo               bool      `json:"activo"`
	CreadoEn             time.Time `json:"creado_en"`
}
