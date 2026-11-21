export interface SesionParametro {
  nombre: string;
  valor: string;
  comparativa: string;
  optimo?: boolean;
}

export interface SesionEstetica {
  id: string;
  numeroSesion: number;
  titulo: string;
  etapa: "Pre-Cirugía" | "Post-Cirugía" | "Acompañamiento Diario";
  fecha: string;
  institucion: string;
  profesional: string;
  estado: "completado" | "en_proceso";
  descripcion: string;
  destacado?: boolean;
  evaluacion: {
    edema: string;
    simetria: string;
    calidadPiel: string;
    resumen: string;
    conclusion: string;
    parametros?: SesionParametro[];
    firmaMedico: string;
    matricula: string;
  };
}

export interface IndicacionProtocolo {
  id: string;
  etapa: "Pre-Cirugía" | "Post-Cirugía" | "Acompañamiento Diario";
  titulo: string;
  fechaEmision: string;
  frecuencia: string;
  profesional: string;
  institucion: string;
  estado: "activo" | "completado";
  detalles: {
    objetivo: string;
    pasos: {
      momento: string;
      accion: string;
      recomendacion: string;
    }[];
    observaciones?: string;
  };
}

export interface NotaMedica {
  id: string;
  fecha: string;
  hora: string;
  remitente?: "profesional" | "paciente";
  profesional: {
    nombre: string;
    especialidad: string;
    matricula: string;
    avatarUrl?: string;
  };
  titulo: string;
  etapa: "Pre-Cirugía" | "Post-Cirugía" | "Acompañamiento Diario";
  mensaje: string;
  importancia: "alta" | "media" | "rutina";
  leida: boolean;
  seguimiento?: string;
}

export interface TurnoProximo {
  id: string;
  fecha: string;
  hora: string;
  profesional: string;
  especialidad: string;
  lugar: string;
  modalidad: "Presencial en Atelier" | "Control Virtual";
  indicacionesPrevias?: string;
}

export interface PacientePortal {
  id: string;
  dni: string;
  passwordDemo: string;
  nombre: string;
  apellido: string;
  genero: string;
  fechaNacimiento: string;
  edad: number;
  email: string;
  telefono: string;
  direccion: string;
  obraSocial: string;
  numeroAfiliado: string;
  plan: string;
  biotipoCutaneo: string;
  procedimientoPrincipal: string;
  etapaActual: "Pre-Cirugía" | "Post-Cirugía" | "Acompañamiento Diario";
  alergias: string[];
  antecedentes: string[];
  medicaCabecera: {
    nombre: string;
    especialidad: string;
    matricula: string;
    email: string;
    horariosAtencion: string;
  };
  sesiones: SesionEstetica[];
  indicaciones: IndicacionProtocolo[];
  notas: NotaMedica[];
  proximoTurno?: TurnoProximo;
}
