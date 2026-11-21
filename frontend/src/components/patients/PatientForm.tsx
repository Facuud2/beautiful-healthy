import React from "react";

interface PatientFormProps {
  editMode?: boolean;
}

const PatientForm: React.FC<PatientFormProps> = ({ editMode }) => {
  // Formulario para crear o editar paciente
  return (
    <div>
      <h2>{editMode ? "Editar Paciente" : "Crear Paciente"}</h2>
      {/* Aquí va el formulario */}
      <form>
        {/* Campos de ejemplo */}
        <input type="text" placeholder="Nombre" />
        <input type="text" placeholder="Apellido" />
        <input type="text" placeholder="DNI" />
        {/* ...otros campos... */}
        <button type="submit">{editMode ? "Guardar Cambios" : "Crear Paciente"}</button>
      </form>
    </div>
  );
};

export default PatientForm;
