// types/paciente.ts
export interface Paciente {
  id?: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  nro_credencial?: string | null;
  dni?: string | null;
  obra_social?: string | null;
  condicion_iva?: string | null;
  plan?: string | null;
  creado_por_usuario?: string | null;
  consultorio_id?: string | null;
  creado_en?: string;
}

export interface CreatePacienteRequest {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  dni?: string;
  genero?: string;
  calle?: string;
  numero?: string;
  localidad?: string;
  codigo_postal?: string;
  telefono?: string;
  nro_credencial?: string;
  obra_social?: string;
  condicion_iva?: string;
  plan?: string;
  creado_por_usuario?: string;
  consultorio_id?: string;
}