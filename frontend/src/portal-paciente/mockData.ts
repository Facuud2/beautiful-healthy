import { PacientePortal } from "./types";

export const MOCK_PACIENTES: PacientePortal[] = [
  {
    id: "pac-01",
    dni: "38492104",
    passwordDemo: "paciente123",
    nombre: "Valentina",
    apellido: "Montes",
    genero: "Femenino",
    fechaNacimiento: "14/05/1994",
    edad: 31,
    email: "valentina.montes@mail.com",
    telefono: "+54 9 11 6421-8890",
    direccion: "Av. Alvear 1840, Piso 4 B, Recoleta",
    obraSocial: "Particular",
    numeroAfiliado: "38492104",
    plan: "Seguimiento Médico",
    biotipoCutaneo: "Eudérmica • Fototipo III",
    procedimientoPrincipal: "Rinoplastia Ultrasónica + Armonización Facial",
    etapaActual: "Post-Cirugía",
    alergias: ["Ninguna alergia medicamentosa conocida"],
    antecedentes: [
      "Estudios prequirúrgicos completos",
      "Cicatrización normotrófica sin complicaciones",
      "Controles periódicos con la Dra. Valeria Montes",
    ],
    medicaCabecera: {
      nombre: "Dra. Valeria Montes",
      especialidad: "Cirujana Plástica y Estética",
      matricula: "MN 148.920",
      email: "dra.montes@consultorio.com",
      horariosAtencion: "Lunes a Viernes de 09:00 a 19:00 hs",
    },
    proximoTurno: {
      id: "tur-101",
      fecha: "Jueves 22 de Octubre",
      hora: "16:30 hs",
      profesional: "Dra. Valeria Montes",
      especialidad: "Control evolutivo y ultrasonido descongestivo",
      lugar: "Consultorio Av. Quintana 480, Piso 3 (Recoleta)",
      modalidad: "Presencial en Atelier",
      indicacionesPrevias:
        "Asistir con la piel limpia sin maquillaje ni cremas y mantener las cintas microporosas colocadas para la revisión en consultorio.",
    },
    sesiones: [
      {
        id: "ses-01",
        numeroSesion: 1,
        titulo: "Sesión 1 • Evaluación Inicial y Planificación",
        etapa: "Pre-Cirugía",
        fecha: "02/10/2026",
        institucion: "Consultorio Recoleta",
        profesional: "Dra. Valeria Montes",
        estado: "completado",
        descripcion:
          "Valoración inicial del perfil, evaluación cutánea e indicaciones de preparación previas al procedimiento.",
        destacado: false,
        evaluacion: {
          edema: "Sin inflamación basal",
          simetria: "Evaluación de línea media y dorso nasal",
          calidadPiel: "Barrera cutánea hidratada",
          resumen:
            "Se acordaron los objetivos del procedimiento y se entregaron las pautas previas.",
          conclusion:
            "Paciente en condiciones óptimas para el procedimiento programado.",
          firmaMedico: "Dra. Valeria Montes",
          matricula: "MN 148.920",
        },
      },
      {
        id: "ses-02",
        numeroSesion: 2,
        titulo: "Sesión 2 • Primer Control en Consultorio (72 hs)",
        etapa: "Post-Cirugía",
        fecha: "08/10/2026",
        institucion: "Consultorio Recoleta",
        profesional: "Dra. Valeria Montes",
        estado: "completado",
        descripcion:
          "Revisión de férula nasal, higiene suave en consultorio y primera sesión de drenaje linfático manual.",
        destacado: true,
        evaluacion: {
          edema: "Inflamación leve esperable a las 72 hs",
          simetria: "Dorso centrado y férula bien posicionada",
          calidadPiel: "Sin hematomas perioculares, herida limpia",
          resumen:
            "Buena respuesta inicial, sin dolor agudo y cumpliendo el reposo con cabecera elevada.",
          conclusion:
            "Continuar con frío local intermitente y descanso con doble almohada.",
          firmaMedico: "Dra. Valeria Montes",
          matricula: "MN 148.920",
        },
      },
      {
        id: "ses-03",
        numeroSesion: 3,
        titulo: "Sesión 3 • Retiro de Férula y Control Evolutivo (Día 7)",
        etapa: "Post-Cirugía",
        fecha: "15/10/2026",
        institucion: "Consultorio Recoleta",
        profesional: "Dra. Valeria Montes",
        estado: "completado",
        descripcion:
          "Retiro de férula termoplástica, control de desinflamación y colocación de cintas microporosas de soporte.",
        destacado: true,
        evaluacion: {
          edema: "Reducción marcada del edema en puente y mejillas",
          simetria: "Perfil armónico y buena alineación",
          calidadPiel: "Cicatriz limpia y epitelización completa",
          resumen:
            "Desinflamación muy favorable en tercio medio facial.",
          conclusion:
            "Continuar con cintas microporosas nocturnas y bruma descongestiva.",
          firmaMedico: "Dra. Valeria Montes",
          matricula: "MN 148.920",
        },
      },
    ],
    indicaciones: [
      {
        id: "ind-01",
        etapa: "Post-Cirugía",
        titulo: "Indicaciones para Control Evolutivo y Retiro de Férula",
        fechaEmision: "Próxima sesión programada",
        frecuencia: "Indicaciones vigentes",
        profesional: "Dra. Valeria Montes",
        institucion: "Consultorio Dra. Valeria Montes",
        estado: "activo",
        detalles: {
          objetivo:
            "Indicaciones asignadas por la profesional para tu cuidado actual y preparación para la próxima sesión.",
          pasos: [
            {
              momento: "Mañana y noche",
              accion: "Higiene suave con solución fisiológica o bruma termal",
              recomendacion:
                "Limpiar suavemente sin frotar ni presionar el dorso nasal.",
            },
            {
              momento: "Cada 4 horas",
              accion: "Aplicar frío local en pómulos",
              recomendacion:
                "Colocar gel frío durante 10 a 15 minutos en mejillas sin apoyar sobre la nariz.",
            },
            {
              momento: "Al dormir",
              accion: "Cintas microporosas y cabecera elevada",
              recomendacion:
                "Dormir boca arriba con doble almohada y mantener las cintas nocturnas hasta el próximo control.",
            },
          ],
          observaciones:
            "Evitar exposición solar directa, ambientes de calor intenso y esfuerzo físico hasta la próxima sesión.",
        },
      },
    ],
    notas: [
      {
        id: "nota-03",
        fecha: "Ayer",
        hora: "18:15 hs",
        remitente: "paciente",
        profesional: {
          nombre: "Valentina Montes",
          especialidad: "Paciente",
          matricula: "",
        },
        titulo: "Mensaje",
        etapa: "Acompañamiento Diario",
        importancia: "media",
        leida: true,
        mensaje:
          "Hola Dra. Valeria! Hoy casi no tuve inflamación a la tarde y dormí muy bien con la almohada elevada. No siento ninguna molestia.",
      },
      {
        id: "nota-02",
        fecha: "Ayer",
        hora: "18:30 hs",
        remitente: "profesional",
        profesional: {
          nombre: "Dra. Valeria Montes",
          especialidad: "Cirujana Plástica y Estética",
          matricula: "MN 148.920",
        },
        titulo: "Mensaje directo",
        etapa: "Acompañamiento Diario",
        importancia: "rutina",
        leida: true,
        mensaje:
          "Qué bueno leerte así Valentina. Esa constancia con el descanso hace toda la diferencia. Esta noche aplicá la crema reparadora alrededor de los pómulos.",
      },
      {
        id: "nota-01",
        fecha: "Hoy",
        hora: "09:40 hs",
        remitente: "profesional",
        profesional: {
          nombre: "Dra. Valeria Montes",
          especialidad: "Cirujana Plástica y Estética",
          matricula: "MN 148.920",
        },
        titulo: "Mensaje directo",
        etapa: "Post-Cirugía",
        importancia: "alta",
        leida: false,
        mensaje:
          "Buen día Valentina! Te dejé cargadas las indicaciones para tu próxima sesión. Recordá mantener la bruma termal hoy y cualquier duda escribime por acá.",
      },
    ],
  },
];
