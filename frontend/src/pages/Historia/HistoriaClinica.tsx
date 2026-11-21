import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Save,
  X,
  Plus,
  MessageSquare,
} from "lucide-react";

interface Paciente {
  id: string;
  dni: string;
  apellido: string;
  nombre: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  domicilio?: string;
  edad?: number;
  sexo?: string;
  procedimiento?: string;
}

interface PerfilEstetico {
  biotipoCutaneo: string;
  fototipoFitzpatrick: string;
  cicatrizacionPrevia: string;
  alergiasSensibilidades: string;
  objetivoEstetico: string;
}

interface SesionHistorial {
  id: string;
  numeroSesion: number;
  diaPostOp: string;
  edemaIndice: string;
  fecha: string;
  titulo: string;
  evolucionClinica: string;
  estadoPielCicatriz: string;
  observacionesDetalladas: string;
  indicacionAsignada: string;
}

const INITIAL_SESSIONS: SesionHistorial[] = [
  {
    id: "s4",
    numeroSesion: 4,
    diaPostOp: "D+18",
    edemaIndice: "12%",
    fecha: "2026-10-18",
    titulo: "Control de evolución tisular y alta de férula nocturna",
    evolucionClinica: "Edema residual mínimo en suprapunta al despertar; dorso simétrico.",
    estadoPielCicatriz: "Epitelización columelar completa, sin fibrosis palpable.",
    observacionesDetalladas:
      "Tejidos blandos desinflamados y definición proyectada según plan quirúrgico. Se programa control fotográfico al mes.",
    indicacionAsignada:
      "Continuar fotoprotección mineral SPF 50+ y masaje linfático digital 5 min por noche.",
  },
  {
    id: "s3",
    numeroSesion: 3,
    diaPostOp: "D+7",
    edemaIndice: "38%",
    fecha: "2026-10-07",
    titulo: "Retiro de férula termoplástica y ultrasonido de 3 MHz",
    evolucionClinica: "Reducción marcada del edema periorbitario; tabique centrado.",
    estadoPielCicatriz: "Cicatriz limpia, retiro de puntos columelares sin tensión.",
    observacionesDetalladas:
      "Respuesta favorable al drenaje linfático asistido. Se coloca vendaje microporoso de contención.",
    indicacionAsignada:
      "Iniciar cintas microporosas nocturnas y bruma descongestiva cada 6 hs.",
  },
  {
    id: "s2",
    numeroSesion: 2,
    diaPostOp: "D+3",
    edemaIndice: "78%",
    fecha: "2026-10-03",
    titulo: "Primer control postoperatorio (72 hs) y drenaje manual",
    evolucionClinica: "Pico inflamatorio esperable en tercio medio; férula íntegra.",
    estadoPielCicatriz: "Incisión basal limpia, equimosis leve en párpado inferior.",
    observacionesDetalladas:
      "Buena tolerancia analgésica sin sangrado activo. Se realiza higiene endonasal con solución hipertónica.",
    indicacionAsignada:
      "Crioterapia local intermitente 15 min cada 3 hs y cabecera elevada a 45°.",
  },
  {
    id: "s1",
    numeroSesion: 1,
    diaPostOp: "Pre-Op",
    edemaIndice: "0%",
    fecha: "2026-09-25",
    titulo: "Evaluación craneofacial basal y marcación ultrasónica",
    evolucionClinica: "Desviación septal derecha y giba osteocartilaginosa de 3.2 mm.",
    estadoPielCicatriz: "Cobertura dérmica de espesor intermedio; preparación tópica previa.",
    observacionesDetalladas:
      "Se documentan fotografías clínicas en 6 proyecciones y tomografía de macizo facial.",
    indicacionAsignada:
      "Ayuno absoluto de 8 hs, suspensión de AINEs y protocolo con Árnica montana.",
  },
];

const HistoriaClinica = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [perfilEstetico, setPerfilEstetico] = useState<PerfilEstetico>({
    biotipoCutaneo: "Eudérmica con espesor dérmico intermedio en tercio medio",
    fototipoFitzpatrick: "Fototipo III · Tolerancia lumínica normal",
    cicatrizacionPrevia: "Normotrófica, sin antecedentes de queloide",
    alergiasSensibilidades: "Sin alergias medicamentosas registradas",
    objetivoEstetico: "Rinoplastia estructural ultrasónica y preservación funcional",
  });

  const [sesiones, setSesiones] = useState<SesionHistorial[]>(INITIAL_SESSIONS);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<PerfilEstetico>(perfilEstetico);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [nuevaSesion, setNuevaSesion] = useState({
    fecha: new Date().toISOString().split("T")[0],
    titulo: "",
    evolucionClinica: "",
    estadoPielCicatriz: "",
    observacionesDetalladas: "",
    indicacionAsignada: "",
  });

  useEffect(() => {
    if (location.state?.paciente) {
      const raw = location.state.paciente;
      setPaciente({
        ...raw,
        domicilio: raw.domicilio || "Av. Alvear 1840, Recoleta",
        sexo: raw.sexo || raw.genero || "F · 31a",
        procedimiento:
          raw.procedimiento || "Rinoplastia ultrasónica + septoplastia funcional",
      });
    } else {
      setPaciente({
        id: "1",
        dni: "38.492.104",
        apellido: "Quiroga",
        nombre: "Valentina",
        fechaNacimiento: "1994-05-14",
        telefono: "+54 9 11 6421-8890",
        email: "valentina.quiroga@arnet.com.ar",
        domicilio: "Av. Alvear 1840, Recoleta",
        sexo: "F · 31a",
        procedimiento: "Rinoplastia ultrasónica + septoplastia funcional",
      });
    }
  }, [location.state]);

  const handleSavePerfil = () => {
    setPerfilEstetico(editingPerfil);
    setIsEditing(false);
    toast.success("Parámetros clínicos actualizados");
  };

  const handleAddSession = () => {
    if (!nuevaSesion.titulo.trim()) {
      toast.error("Ingresá un motivo clínico para la sesión");
      return;
    }
    const nextNum = sesiones.length + 1;
    const created: SesionHistorial = {
      id: `s${nextNum}`,
      numeroSesion: nextNum,
      diaPostOp: `D+${nextNum * 5}`,
      edemaIndice: "8%",
      fecha: nuevaSesion.fecha,
      titulo: nuevaSesion.titulo,
      evolucionClinica:
        nuevaSesion.evolucionClinica || "Evolución dentro de parámetros clínicos esperables.",
      estadoPielCicatriz:
        nuevaSesion.estadoPielCicatriz || "Tejido desinflamado y adecuada coaptación.",
      observacionesDetalladas:
        nuevaSesion.observacionesDetalladas ||
        "Control registrado en consultorio sin intercurrencias.",
      indicacionAsignada:
        nuevaSesion.indicacionAsignada ||
        "Mantener pautas de fotoprotección e hidratación.",
    };
    setSesiones([created, ...sesiones]);
    setShowNewSessionModal(false);
    setNuevaSesion({
      fecha: new Date().toISOString().split("T")[0],
      titulo: "",
      evolucionClinica: "",
      estadoPielCicatriz: "",
      observacionesDetalladas: "",
      indicacionAsignada: "",
    });
    toast.success("Sesión incorporada al registro clínico");
  };

  if (!paciente) {
    return (
      <div className="p-8 text-center text-[#7D726D]">
        Cargando registro clínico...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera de lienzo: Un único h1 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#E8DDD5]">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary p-2 shrink-0 mt-0.5"
            aria-label="Volver a la pantalla anterior"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
              Historia clínica · {paciente.apellido}, {paciente.nombre}
            </h1>
            <p className="text-sm text-[#7D726D] mt-1 num">
              DNI {paciente.dni} · {paciente.procedimiento} · Edema reducido al 12% en día D+18
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              navigate("/mensajeria", {
                state: { patientId: paciente.id, patientName: paciente.nombre },
              })
            }
            className="btn-secondary"
          >
            <MessageSquare className="w-4 h-4 text-[#7D726D]" />
            <span>Abrir canal paciente</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNewSessionModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar sesión</span>
          </button>
        </div>
      </div>

      {/* Tira de 4 indicadores biométricos del paciente */}
      <section
        aria-label="Parámetros quirúrgicos del paciente"
        className="ledger-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8DDD5]"
      >
        <div className="p-4 sm:p-5">
          <p className="text-sm font-medium text-[#7D726D]">Edema residual actual</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl font-semibold text-[#2A2421]">12%</span>
            <span className="num text-xs font-medium text-[#1b6e3c]">-66 pts desde D+3</span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1">Medición ultrasónica en suprapunta</p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm font-medium text-[#7D726D]">Sesiones registradas</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl font-semibold text-[#2A2421]">{sesiones.length} / 6</span>
            <span className="num text-xs font-medium text-[#2A2421]">Próxima: D+30</span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1">Protocolo post-rinoplastia ultrasónica</p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm font-medium text-[#7D726D]">Fototipo y espesor dérmico</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl font-semibold text-[#2A2421]">Tipo III</span>
            <span className="num text-xs font-medium text-[#1b6e3c]">Cicatriz normotrófica</span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1">Sin fibrosis ni retracción alar</p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-sm font-medium text-[#7D726D]">Vía aérea nasal (rinomanometría)</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl font-semibold text-[#2A2421]">640 ml/s</span>
            <span className="num text-xs font-medium text-[#1b6e3c]">+190 ml/s vs. basal</span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1">Válvula interna permeable bilateral</p>
        </div>
      </section>

      {/* Fila central: Curva individual + Lámina anatómica de pares craneales (Wellcome Collection) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="ledger-panel p-5 lg:col-span-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8DDD5]">
            <div>
              <h2 className="text-base font-semibold text-[#2A2421]">
                Curva de desinflamación tisular por sesión (Pre-Op a D+18)
              </h2>
              <p className="text-sm text-[#7D726D] mt-0.5">
                Evolución del edema facial (%) y permeabilidad ventilatoria tras retiro de férula en D+7
              </p>
            </div>
            <span className="num text-xs font-medium text-[#1d5fbf]">
              Serie individual HC-26-041
            </span>
          </div>

          <div className="my-4">
            <svg
              viewBox="0 0 640 185"
              className="w-full h-44 overflow-visible"
              role="img"
              aria-label="Curva de evolución del paciente entre evaluación preoperatoria y día 18"
            >
              <line x1="40" y1="20" x2="620" y2="20" stroke="#E8DDD5" strokeDasharray="3 3" />
              <line x1="40" y1="75" x2="620" y2="75" stroke="#E8DDD5" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="620" y2="130" stroke="#E8DDD5" />

              <text x="32" y="24" textAnchor="end" className="fill-[#7D726D] text-[12px] num">80%</text>
              <text x="32" y="79" textAnchor="end" className="fill-[#7D726D] text-[12px] num">40%</text>
              <text x="32" y="134" textAnchor="end" className="fill-[#7D726D] text-[12px] num">0%</text>

              <path
                d="M 70 130 L 240 24 L 410 78 L 580 114 L 580 130 L 70 130 Z"
                fill="#1d5fbf"
                fillOpacity="0.08"
              />
              <path
                d="M 70 130 L 240 24 L 410 78 L 580 114"
                fill="none"
                stroke="#1d5fbf"
                strokeWidth="2.25"
              />

              <circle cx="70" cy="130" r="3.5" fill="#1d5fbf" />
              <circle cx="240" cy="24" r="3.5" fill="#1d5fbf" />
              <circle cx="410" cy="78" r="4" fill="#ffffff" stroke="#1d5fbf" strokeWidth="2.25" />
              <circle cx="580" cy="114" r="3.5" fill="#1d5fbf" />

              <text x="70" y="154" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">Sesión 1 (Pre-Op)</text>
              <text x="240" y="154" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">Sesión 2 (D+3 · 78%)</text>
              <text x="410" y="154" textAnchor="middle" className="fill-[#2A2421] font-medium text-[12px] num">Sesión 3 (D+7 · 38%)</text>
              <text x="580" y="154" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">Sesión 4 (D+18 · 12%)</text>
            </svg>
          </div>

          <div className="pt-3 border-t border-[#E8DDD5] flex flex-wrap items-center justify-between gap-2 text-sm text-[#7D726D]">
            <span>Osteotomía piezoeléctrica sin equimosis malar tardía</span>
            <span className="num text-[#2A2421] font-medium">Próximo control: 18/11/2026</span>
          </div>
        </section>

        {/* Lámina anatómica de referencia (Wellcome Collection CC BY 4.0) */}
        <aside className="ledger-panel p-5 lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="pb-3 border-b border-[#E8DDD5]">
            <h2 className="text-base font-semibold text-[#2A2421]">
              Cartografía nerviosa craneofacial
            </h2>
            <p className="text-sm text-[#7D726D] mt-0.5">
              Referencia de sensibilidad infraorbitaria y rama nasal externa
            </p>
          </div>

          <figure className="space-y-2.5">
            <div className="overflow-hidden rounded-[6px] border border-[#E8DDD5] bg-[#FAF7F5] max-h-44 flex items-center justify-center">
              <img
                src="/assets/anatomy-of-nerves-of-the-head-and.jpg"
                width={1154}
                height={1596}
                alt="Grabado anatómico histórico de los nervios craneales y del tronco de la Wellcome Collection"
                className="w-full h-44 object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="text-sm text-[#7D726D] leading-relaxed">
              Evaluación de sensibilidad en punta nasal conservada sin parestesias. Fuente:{" "}
              <a
                href="https://commons.wikimedia.org/wiki/File:Anatomy_of_the_nerves_of_head_and_trunk._Muller._Wellcome_L0007574.jpg"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#2A2421]"
              >
                Wellcome Collection (CC BY 4.0)
              </a>
              .
            </figcaption>
          </figure>
        </aside>
      </div>

      {/* Registro cronológico de sesiones */}
      <section className="ledger-panel overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E8DDD5] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#2A2421]">
              Actas de sesiones clínicas ({sesiones.length})
            </h2>
            <p className="text-sm text-[#7D726D] mt-0.5">
              Evolución morfológica, estado de cicatrización e indicaciones entregadas
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#E8DDD5]">
          {sesiones.map((ses) => (
            <article key={ses.id} className="p-4 sm:p-5 space-y-3 hover:bg-[#FAF7F5]/40 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="num px-2 py-0.5 rounded-[4px] bg-[#FAF7F5] border border-[#E8DDD5] text-xs font-semibold text-[#2A2421]">
                    Sesión {ses.numeroSesion} · {ses.diaPostOp}
                  </span>
                  <h3 className="text-sm font-semibold text-[#2A2421]">
                    {ses.titulo}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#7D726D] num">
                  <span>Edema: <strong className="text-[#2A2421]">{ses.edemaIndice}</strong></span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ses.fecha}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm pt-1">
                <div className="p-3 rounded-[6px] bg-[#FAF7F5]/70 border border-[#E8DDD5]">
                  <span className="font-medium text-[#7D726D] block">
                    Evolución clínica
                  </span>
                  <span className="text-[#2A2421] mt-1 block leading-relaxed">
                    {ses.evolucionClinica}
                  </span>
                </div>

                <div className="p-3 rounded-[6px] bg-[#FAF7F5]/70 border border-[#E8DDD5]">
                  <span className="font-medium text-[#7D726D] block">
                    Cobertura cutánea y sutura
                  </span>
                  <span className="text-[#2A2421] mt-1 block leading-relaxed">
                    {ses.estadoPielCicatriz}
                  </span>
                </div>

                <div className="p-3 rounded-[6px] bg-[#FAF7F5]/70 border border-[#E8DDD5]">
                  <span className="font-medium text-[#7D726D] block">
                    Indicación prescripta
                  </span>
                  <span className="text-[#2A2421] font-medium mt-1 block leading-relaxed">
                    {ses.indicacionAsignada}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#7D726D] leading-relaxed">
                <strong className="text-[#2A2421] font-medium">Nota quirúrgica:</strong>{" "}
                {ses.observacionesDetalladas}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Antecedentes y Parámetros Clínicos del Paciente */}
      <section className="ledger-panel p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD5]">
          <div>
            <h2 className="text-base font-semibold text-[#2A2421]">
              Parámetros basales y antecedentes tisulares
            </h2>
            <p className="text-sm text-[#7D726D] mt-0.5">
              Información estructural para planificación quirúrgica y seguimiento dermatológico
            </p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setEditingPerfil(perfilEstetico);
                setIsEditing(true);
              }}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar parámetros</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSavePerfil}
                className="btn-primary text-sm py-1.5 px-3"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: "biotipoCutaneo" as const,
              label: "Biotipo cutáneo y elasticidad",
            },
            {
              key: "fototipoFitzpatrick" as const,
              label: "Clasificación Fitzpatrick",
            },
            {
              key: "cicatrizacionPrevia" as const,
              label: "Respuesta cicatrizal previa",
            },
            {
              key: "alergiasSensibilidades" as const,
              label: "Alergias y medicación basal",
            },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-[#7D726D] mb-1.5">
                {field.label}
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editingPerfil[field.key]}
                  onChange={(e) =>
                    setEditingPerfil({
                      ...editingPerfil,
                      [field.key]: e.target.value,
                    })
                  }
                  className="input-field"
                />
              ) : (
                <div className="p-3 rounded-[6px] bg-[#FAF7F5]/60 border border-[#E8DDD5] text-sm text-[#2A2421] leading-relaxed">
                  {perfilEstetico[field.key]}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal para Registrar Nueva Sesión */}
      {showNewSessionModal && (
        <div
          data-ui="modal"
          className="fixed inset-0 bg-[#2A2421]/40 flex items-center justify-center z-50 p-4"
        >
          <div className="ledger-panel p-6 max-w-lg w-full space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD5]">
              <h3 className="text-base font-semibold text-[#2A2421]">
                Registrar sesión en historia clínica
              </h3>
              <button
                type="button"
                onClick={() => setShowNewSessionModal(false)}
                className="p-1.5 rounded-[6px] text-[#7D726D] hover:text-[#2A2421] bg-[#FAF7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Fecha de la sesión
                  </label>
                  <input
                    type="date"
                    value={nuevaSesion.fecha}
                    onChange={(e) =>
                      setNuevaSesion({ ...nuevaSesion, fecha: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Motivo clínico
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Control D+14 y drenaje"
                    value={nuevaSesion.titulo}
                    onChange={(e) =>
                      setNuevaSesion({ ...nuevaSesion, titulo: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Evolución clínica
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Desinflamación favorable"
                    value={nuevaSesion.evolucionClinica}
                    onChange={(e) =>
                      setNuevaSesion({
                        ...nuevaSesion,
                        evolucionClinica: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Cobertura cutánea y sutura
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Cicatriz limpia y sin costras"
                    value={nuevaSesion.estadoPielCicatriz}
                    onChange={(e) =>
                      setNuevaSesion({
                        ...nuevaSesion,
                        estadoPielCicatriz: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7D726D] mb-1">
                  Observaciones quirúrgicas
                </label>
                <textarea
                  rows={3}
                  placeholder="Anotá las observaciones clínicas de la sesión..."
                  value={nuevaSesion.observacionesDetalladas}
                  onChange={(e) =>
                    setNuevaSesion({
                      ...nuevaSesion,
                      observacionesDetalladas: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7D726D] mb-1">
                  Indicaciones prescriptas
                </label>
                <input
                  type="text"
                  placeholder="Ej: Masaje linfático suave y protector solar SPF 50+"
                  value={nuevaSesion.indicacionAsignada}
                  onChange={(e) =>
                    setNuevaSesion({
                      ...nuevaSesion,
                      indicacionAsignada: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E8DDD5]">
              <button
                type="button"
                onClick={() => setShowNewSessionModal(false)}
                className="btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button type="button" onClick={handleAddSession} className="btn-primary text-xs">
                Guardar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriaClinica;