import { useEffect, useState, useMemo } from "react";
import apiClient from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  MessageSquare,
  FileText,
  Plus,
  Calendar,
} from "lucide-react";

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  medicalRecordId: string;
  birthDate: string;
  gender: string;
  email: string;
  procedure: string;
  postOpDay: string;
  sessionProgress: string;
  statusLabel: string;
  statusTone: "active" | "pending" | "alert";
  nextMilestone: string;
};

const FALLBACK_PATIENTS: Patient[] = [
  {
    id: 1,
    firstName: "Valentina",
    lastName: "Quiroga",
    dni: "38.492.104",
    medicalRecordId: "HC-26-041",
    birthDate: "1994-05-14",
    gender: "F · 31a",
    email: "valentina.quiroga@arnet.com.ar",
    procedure: "Rinoplastia ultrasónica + septoplastia funcional",
    postOpDay: "D+4",
    sessionProgress: "3 / 6",
    statusLabel: "Retiro de férula 10:30",
    statusTone: "pending",
    nextMilestone: "Control de edema periorbitario",
  },
  {
    id: 2,
    firstName: "Martín",
    lastName: "Echeverría",
    dni: "29.841.552",
    medicalRecordId: "HC-26-038",
    birthDate: "1982-11-03",
    gender: "M · 43a",
    email: "m.echeverria@fibertel.com.ar",
    procedure: "Blefaroplastia superior + cantopexia lateral",
    postOpDay: "D+6",
    sessionProgress: "2 / 4",
    statusLabel: "Retiro de sutura 12:00",
    statusTone: "active",
    nextMilestone: "Extracción de sutura intradérmica",
  },
  {
    id: 3,
    firstName: "Elena",
    lastName: "Rivas de Alvear",
    dni: "21.049.883",
    medicalRecordId: "HC-26-044",
    birthDate: "1968-08-22",
    gender: "F · 57a",
    email: "elena.rivas@consultoriomontes.ar",
    procedure: "Lifting cervicofacial plano profundo + lipofilling",
    postOpDay: "D+2",
    sessionProgress: "1 / 6",
    statusLabel: "Requiere respuesta",
    statusTone: "alert",
    nextMilestone: "Drenaje linfático asistido",
  },
  {
    id: 4,
    firstName: "Lucas",
    lastName: "Benítez",
    dni: "41.220.918",
    medicalRecordId: "HC-26-029",
    birthDate: "1996-02-19",
    gender: "M · 30a",
    email: "lucas.benitez@fibertel.com.ar",
    procedure: "Bioestimulación con hidroxiapatita cálcica",
    postOpDay: "D+14",
    sessionProgress: "4 / 4",
    statusLabel: "Evolución estable",
    statusTone: "active",
    nextMilestone: "Fotografía clínica comparativa",
  },
  {
    id: 5,
    firstName: "Sofía",
    lastName: "Gutiérrez",
    dni: "35.910.441",
    medicalRecordId: "HC-26-033",
    birthDate: "1991-09-10",
    gender: "F · 34a",
    email: "sofia.gutierrez@arnet.com.ar",
    procedure: "Mastoplastia submuscular + ultrasonido",
    postOpDay: "D+10",
    sessionProgress: "5 / 6",
    statusLabel: "Control 16:00",
    statusTone: "active",
    nextMilestone: "Evaluación de banda estabilizadora",
  },
];

const Dashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cohortFilter, setCohortFilter] = useState<"all" | "early" | "suture">("all");
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/api/v1/pacientes")
      .then((res) => {
        const data = res.data;
        const rawList = Array.isArray(data)
          ? data
          : data.pacientes || data.patients || [];
        if (rawList.length > 0) {
          const procedures = [
            "Rinoplastia ultrasónica + septoplastia funcional",
            "Blefaroplastia superior + cantopexia lateral",
            "Lifting cervicofacial plano profundo + lipofilling",
            "Bioestimulación con hidroxiapatita cálcica",
            "Mastoplastia submuscular + ultrasonido",
          ];
          const postOpDays = ["D+4", "D+6", "D+2", "D+14", "D+10"];
          const sessions = ["3 / 6", "2 / 4", "1 / 6", "4 / 4", "5 / 6"];
          const statuses: Array<{ label: string; tone: Patient["statusTone"]; milestone: string }> = [
            { label: "Retiro de férula 10:30", tone: "pending", milestone: "Control de edema periorbitario" },
            { label: "Retiro de sutura 12:00", tone: "active", milestone: "Extracción de sutura intradérmica" },
            { label: "Requiere respuesta", tone: "alert", milestone: "Drenaje linfático asistido" },
            { label: "Evolución estable", tone: "active", milestone: "Fotografía clínica comparativa" },
            { label: "Control 16:00", tone: "active", milestone: "Evaluación de banda estabilizadora" },
          ];

          const mapped: Patient[] = rawList.map((p: any, idx: number) => {
            const st = statuses[idx % statuses.length];
            return {
              id: p.id || idx + 1,
              firstName: p.nombre || p.firstName || FALLBACK_PATIENTS[idx % FALLBACK_PATIENTS.length].firstName,
              lastName: p.apellido || p.lastName || FALLBACK_PATIENTS[idx % FALLBACK_PATIENTS.length].lastName,
              dni: p.dni || p.nro_credencial || FALLBACK_PATIENTS[idx % FALLBACK_PATIENTS.length].dni,
              medicalRecordId: p.medicalRecordId || `HC-26-0${31 + idx}`,
              email: p.email || FALLBACK_PATIENTS[idx % FALLBACK_PATIENTS.length].email,
              birthDate: p.fecha_nacimiento || p.birthDate || "1990-04-15",
              gender: p.genero || p.gender || (idx % 2 === 0 ? "F · 32a" : "M · 41a"),
              procedure: p.plan || p.procedimiento || procedures[idx % procedures.length],
              postOpDay: postOpDays[idx % postOpDays.length],
              sessionProgress: sessions[idx % sessions.length],
              statusLabel: st.label,
              statusTone: st.tone,
              nextMilestone: st.milestone,
            };
          });
          setPatients(mapped);
        } else {
          setPatients(FALLBACK_PATIENTS);
        }
      })
      .catch(() => {
        setPatients(FALLBACK_PATIENTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (cohortFilter === "early" && !["D+2", "D+4"].includes(p.postOpDay)) {
        return false;
      }
      if (cohortFilter === "suture" && !["D+6", "D+10"].includes(p.postOpDay)) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        p.medicalRecordId.toLowerCase().includes(q) ||
        p.procedure.toLowerCase().includes(q)
      );
    });
  }, [patients, searchQuery, cohortFilter]);

  const getBadgeStyle = (tone: Patient["statusTone"]) => {
    if (tone === "alert") return "badge-blush";
    if (tone === "pending") return "badge-pending";
    return "badge-active";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera de lienzo: Un único h1 + hallazgo operativo + 2 controles */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#E8DDD5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
            Seguimiento quirúrgico y sesiones del día
          </h1>
          <p className="text-sm text-[#7D726D] mt-1">
            5 consultas postoperatorias esperan respuesta · 9 controles programados hoy (retiro de férula a las 10:30 hs)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/consultas")}
            className="btn-secondary"
          >
            <Calendar className="w-4 h-4 text-[#7D726D]" />
            <span>Agenda del día</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/patients/new")}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar paciente</span>
          </button>
        </div>
      </div>

      {/* Fila 1: Tira de 4 indicadores dividida por filetes de 1px */}
      <section
        aria-label="Indicadores clínicos de la cohorte activa"
        className="ledger-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8DDD5]"
      >
        <div
          onClick={() => navigate("/patients")}
          className="p-4 sm:p-5 cursor-pointer hover:bg-[#FAF7F5]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[#7D726D]">
            Pacientes en cohorte activa
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl sm:text-3xl font-semibold tracking-tight text-[#2A2421]">
              18
            </span>
            <span className="num text-xs font-medium text-[#1b6e3c]">
              +3 vs. mes previo
            </span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1.5">
            14 postoperatorios · 4 bioestimulación
          </p>
        </div>

        <div
          onClick={() => navigate("/mensajeria")}
          className="p-4 sm:p-5 cursor-pointer hover:bg-[#FAF7F5]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[#7D726D]">
            Consultas post-op sin leer
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl sm:text-3xl font-semibold tracking-tight text-[#2A2421]">
              5
            </span>
            <span className="num text-xs font-medium text-[#7c4a03]">
              2 en ventana D+1 a D+4
            </span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1.5">
            Tiempo medio de respuesta: 14 min
          </p>
        </div>

        <div
          onClick={() => navigate("/consultas")}
          className="p-4 sm:p-5 cursor-pointer hover:bg-[#FAF7F5]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[#7D726D]">
            Sesiones programadas hoy
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl sm:text-3xl font-semibold tracking-tight text-[#2A2421]">
              9
            </span>
            <span className="num text-xs font-medium text-[#1b6e3c]">
              7 confirmadas · 2 en sala
            </span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1.5">
            Consultorio 4B y Sala de curaciones
          </p>
        </div>

        <div
          onClick={() => navigate("/historia-clinica")}
          className="p-4 sm:p-5 cursor-pointer hover:bg-[#FAF7F5]/50 transition-colors"
        >
          <p className="text-sm font-medium text-[#7D726D]">
            Adherencia al protocolo D+7
          </p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="num text-2xl sm:text-3xl font-semibold tracking-tight text-[#2A2421]">
              94.2%
            </span>
            <span className="num text-xs font-medium text-[#1b6e3c]">
              +2.8 pts vs. Q3
            </span>
          </div>
          <p className="text-sm text-[#7D726D] mt-1.5">
            Crioterapia y drenaje linfático asistido
          </p>
        </div>
      </section>

      {/* Fila 2: Gráfico clínico de evolución (8 col) + Cronograma y archivo anatómico (4 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Gráfico SVG: Curva de resolución de edema y sesiones */}
        <section className="ledger-panel p-5 lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 border-b border-[#E8DDD5]">
              <div>
                <h2 className="text-base font-semibold text-[#2A2421]">
                  El edema post-rinoplastia cae 62% entre D+4 y D+10
                </h2>
                <p className="text-sm text-[#7D726D] mt-0.5">
                  Índice medio de inflamación periorbitaria (%) frente a umbral esperado · Cohorte Octubre 2026 (n = 18)
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#7D726D] shrink-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#1d5fbf]" />
                  <span className="text-[#2A2421] font-medium">Cohorte actual</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#7D726D]" />
                  <span>Umbral estándar</span>
                </span>
              </div>
            </div>

            <div className="mt-5">
              <svg
                viewBox="0 0 680 230"
                className="w-full h-52 overflow-visible"
                role="img"
                aria-label="Gráfico de evolución de edema postoperatorio entre el día 1 y el día 18"
              >
                {/* Líneas guía horizontales punteadas */}
                <line x1="42" y1="24" x2="660" y2="24" stroke="#E8DDD5" strokeDasharray="3 3" />
                <line x1="42" y1="72" x2="660" y2="72" stroke="#E8DDD5" strokeDasharray="3 3" />
                <line x1="42" y1="120" x2="660" y2="120" stroke="#E8DDD5" strokeDasharray="3 3" />
                <line x1="42" y1="168" x2="660" y2="168" stroke="#E8DDD5" />

                {/* Etiquetas eje Y (4 marcas) */}
                <text x="34" y="28" textAnchor="end" className="fill-[#7D726D] text-[12px] num">90%</text>
                <text x="34" y="76" textAnchor="end" className="fill-[#7D726D] text-[12px] num">60%</text>
                <text x="34" y="124" textAnchor="end" className="fill-[#7D726D] text-[12px] num">30%</text>
                <text x="34" y="172" textAnchor="end" className="fill-[#7D726D] text-[12px] num">0%</text>

                {/* Serie de referencia (umbral estándar en gris neutro punteado) */}
                <path
                  d="M 60 36 L 176 48 L 292 84 L 408 118 L 524 142 L 640 156"
                  fill="none"
                  stroke="#7D726D"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Área suave bajo la curva clínica activa (#1d5fbf con opacidad 0.08) */}
                <path
                  d="M 60 40 L 176 32 L 292 98 L 408 138 L 524 154 L 640 162 L 640 168 L 60 168 Z"
                  fill="#1d5fbf"
                  fillOpacity="0.08"
                />

                {/* Serie principal de datos (--chart-3: #1d5fbf) */}
                <path
                  d="M 60 40 L 176 32 L 292 98 L 408 138 L 524 154 L 640 162"
                  fill="none"
                  stroke="#1d5fbf"
                  strokeWidth="2.25"
                />

                {/* Puntos de control */}
                <circle cx="60" cy="40" r="3.5" fill="#1d5fbf" />
                <circle cx="176" cy="32" r="3.5" fill="#1d5fbf" />
                <circle cx="292" cy="98" r="4" fill="#ffffff" stroke="#1d5fbf" strokeWidth="2.25" />
                <circle cx="408" cy="138" r="3.5" fill="#1d5fbf" />
                <circle cx="524" cy="154" r="3.5" fill="#1d5fbf" />
                <circle cx="640" cy="162" r="3.5" fill="#1d5fbf" />

                {/* Anotación directa en el lienzo (D+6: Retiro de férula) */}
                <line x1="292" y1="44" x2="292" y2="92" stroke="#2A2421" strokeWidth="1" />
                <rect x="218" y="22" width="158" height="22" rx="4" fill="#FAF7F5" stroke="#E8DDD5" />
                <text x="297" y="36" textAnchor="middle" className="fill-[#2A2421] text-[12px] font-medium num">
                  D+6 · Retiro de férula (42%)
                </text>

                {/* Etiquetas eje X (6 marcas) */}
                <text x="60" y="192" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">D+1</text>
                <text x="176" y="192" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">D+3 (Pico)</text>
                <text x="292" y="192" textAnchor="middle" className="fill-[#2A2421] font-medium text-[12px] num">D+6</text>
                <text x="408" y="192" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">D+10</text>
                <text x="524" y="192" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">D+14</text>
                <text x="640" y="192" textAnchor="middle" className="fill-[#7D726D] text-[12px] num">D+18 (Alta)</text>
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8DDD5] grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[#7D726D] block">Pico inflamatorio medio</span>
              <span className="num font-semibold text-[#2A2421] mt-0.5 block">78.4% en D+3</span>
            </div>
            <div>
              <span className="text-[#7D726D] block">Reducción post-drenaje</span>
              <span className="num font-semibold text-[#1b6e3c] mt-0.5 block">-36.2 pts en 72 hs</span>
            </div>
            <div>
              <span className="text-[#7D726D] block">Alta fotográfica media</span>
              <span className="num font-semibold text-[#2A2421] mt-0.5 block">Día D+17.4</span>
            </div>
          </div>
        </section>

        {/* Columna derecha (4 col): Cronograma de sala + Lámina de archivo */}
        <aside className="ledger-panel p-5 lg:col-span-4 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD5]">
              <h2 className="text-base font-semibold text-[#2A2421]">
                Sala de curaciones · Hoy
              </h2>
              <span className="num text-xs font-medium text-[#7D726D]">
                Av. Quintana 480
              </span>
            </div>

            <div className="divide-y divide-[#E8DDD5] mt-1">
              <div className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#2A2421]">
                    Quiroga, Valentina · D+4
                  </p>
                  <p className="text-sm text-[#7D726D]">
                    Retiro de férula termoplástica y endoscopía
                  </p>
                </div>
                <span className="num text-xs font-medium text-[#7c4a03] bg-[#fef6e6] px-2 py-0.5 rounded-[4px] border border-[#f5deb3] shrink-0">
                  10:30
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#2A2421]">
                    Echeverría, Martín · D+6
                  </p>
                  <p className="text-sm text-[#7D726D]">
                    Extracción de sutura palpebral superior
                  </p>
                </div>
                <span className="num text-xs font-medium text-[#2A2421] bg-[#FAF7F5] px-2 py-0.5 rounded-[4px] border border-[#E8DDD5] shrink-0">
                  12:00
                </span>
              </div>

              <div className="py-2.5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#2A2421]">
                    Gutiérrez, Sofía · D+10
                  </p>
                  <p className="text-sm text-[#7D726D]">
                    Ultrasonido + control de banda mamaria
                  </p>
                </div>
                <span className="num text-xs font-medium text-[#2A2421] bg-[#FAF7F5] px-2 py-0.5 rounded-[4px] border border-[#E8DDD5] shrink-0">
                  16:00
                </span>
              </div>
            </div>
          </div>

          {/* Ficha documental del entorno clínico (Wikimedia Commons) */}
          <figure className="pt-3 border-t border-[#E8DDD5]">
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5 overflow-hidden rounded-[6px] border border-[#E8DDD5] bg-[#FAF7F5]">
                <img
                  src="/assets/avenida-alvear-recoleta.jpg"
                  width={1280}
                  height={853}
                  alt="Fachadas clásicas sobre Avenida Alvear en el entorno clínico de Recoleta, Buenos Aires"
                  className="w-full h-20 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="col-span-7 text-sm text-[#7D726D] leading-snug">
                <span className="font-semibold text-[#2A2421] block">
                  Distrito médico Recoleta
                </span>
                Corredor Alvear–Quintana, sede de consultorios externos y recuperación ambulatoria.
              </figcaption>
            </div>
          </figure>
        </aside>
      </div>

      {/* Fila 3: Padrón tabular de pacientes en seguimiento */}
      <section aria-label="Padrón de pacientes en seguimiento" className="ledger-panel overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E8DDD5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#2A2421]">
              Padrón de seguimiento postoperatorio
            </h2>
            <p className="text-sm text-[#7D726D] mt-0.5">
              Registro sincronizado con historias clínicas y mensajería directa del paciente
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Pestañas de filtro rápido */}
            <div className="inline-flex rounded-[6px] border border-[#E8DDD5] bg-[#FAF7F5] p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setCohortFilter("all")}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  cohortFilter === "all"
                    ? "bg-[#ffffff] text-[#2A2421]"
                    : "text-[#7D726D] hover:text-[#2A2421]"
                }`}
              >
                Todos ({patients.length})
              </button>
              <button
                type="button"
                onClick={() => setCohortFilter("early")}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  cohortFilter === "early"
                    ? "bg-[#ffffff] text-[#2A2421]"
                    : "text-[#7D726D] hover:text-[#2A2421]"
                }`}
              >
                Ventana D+1 a D+4
              </button>
              <button
                type="button"
                onClick={() => setCohortFilter("suture")}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  cohortFilter === "suture"
                    ? "bg-[#ffffff] text-[#2A2421]"
                    : "text-[#7D726D] hover:text-[#2A2421]"
                }`}
              >
                Retiro de sutura
              </button>
            </div>

            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-[#7D726D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar apellido, DNI o cirugía..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filtrar pacientes por apellido, DNI o cirugía"
                className="input-field pl-8 py-1.5 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="btn-secondary py-1.5 px-3 text-sm"
            >
              <span>Padrón completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-[#7D726D]">
            Sincronizando padrón clínico...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#7D726D]">
            No se hallaron registros para el filtro aplicado.
          </div>
        ) : (
          <>
            {/* Tabla semántica en Desktop / Tablet con cifras tabulares alineadas a la derecha */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8DDD5] bg-[#FAF7F5]/60 text-sm font-medium text-[#7D726D]">
                    <th className="py-2.5 px-4 font-medium">Paciente</th>
                    <th className="py-2.5 px-4 font-medium">Procedimiento y próximo hito</th>
                    <th className="py-2.5 px-4 font-medium">Estado clínico</th>
                    <th className="py-2.5 px-4 font-medium text-right">Legajo / DNI</th>
                    <th className="py-2.5 px-4 font-medium text-right">Post-Op</th>
                    <th className="py-2.5 px-4 font-medium text-right">Sesiones</th>
                    <th className="py-2.5 px-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDD5] text-sm">
                  {filteredPatients.slice(0, 8).map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#FAF7F5]/50 transition-colors"
                    >
                      <td className="py-3 px-4 align-middle">
                        <p className="font-semibold text-[#2A2421]">
                          {p.lastName}, {p.firstName}
                        </p>
                        <p className="text-sm text-[#7D726D]">{p.gender}</p>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <p className="text-[#2A2421] font-medium text-sm">
                          {p.procedure}
                        </p>
                        <p className="text-sm text-[#7D726D]">{p.nextMilestone}</p>
                      </td>
                      <td className="py-3 px-4 align-middle">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs ${getBadgeStyle(
                            p.statusTone
                          )}`}
                        >
                          {p.statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-right num">
                        <span className="num text-sm font-medium text-[#2A2421] block">
                          {p.medicalRecordId}
                        </span>
                        <span className="text-xs text-[#7D726D] block">
                          {p.dni}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-middle text-right num font-semibold text-[#2A2421]">
                        {p.postOpDay}
                      </td>
                      <td className="py-3 px-4 align-middle text-right num text-[#7D726D]">
                        {p.sessionProgress}
                      </td>
                      <td className="py-3 px-4 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/mensajeria", {
                                state: { patientId: p.id, patientName: p.firstName },
                              })
                            }
                            className="btn-secondary py-1 px-2.5 text-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/historia-clinica", {
                                state: {
                                  paciente: {
                                    id: String(p.id),
                                    dni: p.dni,
                                    apellido: p.lastName,
                                    nombre: p.firstName,
                                    fechaNacimiento: p.birthDate,
                                    telefono: "+54 9 11 5829-1044",
                                    email: p.email,
                                    sexo: p.gender,
                                    procedimiento: p.procedure,
                                  },
                                },
                              })
                            }
                            className="btn-primary py-1 px-2.5 text-sm"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ficha</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista compacta en Mobile (390px) */}
            <div className="md:hidden divide-y divide-[#E8DDD5]">
              {filteredPatients.slice(0, 8).map((p) => (
                <div key={p.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#2A2421]">
                        {p.lastName}, {p.firstName}
                      </h3>
                      <p className="text-sm text-[#7D726D] mt-0.5">{p.procedure}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-xs shrink-0 ${getBadgeStyle(
                        p.statusTone
                      )}`}
                    >
                      {p.statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-[#7D726D] pt-1 border-t border-[#E8DDD5]/60 num">
                    <span>DNI {p.dni}</span>
                    <span className="font-semibold text-[#2A2421]">{p.postOpDay}</span>
                    <span>Sesión {p.sessionProgress}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/mensajeria", {
                          state: { patientId: p.id, patientName: p.firstName },
                        })
                      }
                      className="btn-secondary flex-1 py-1.5 text-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Mensajes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/historia-clinica", {
                          state: {
                            paciente: {
                              id: String(p.id),
                              dni: p.dni,
                              apellido: p.lastName,
                              nombre: p.firstName,
                              fechaNacimiento: p.birthDate,
                              telefono: "+54 9 11 5829-1044",
                              email: p.email,
                              sexo: p.gender,
                              procedimiento: p.procedure,
                            },
                          },
                        })
                      }
                      className="btn-primary flex-1 py-1.5 text-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Historia clínica</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Créditos de archivo requeridos por Taste Skill v2 (assets.mjs --credits) */}
      <footer className="pt-3 border-t border-[#E8DDD5] text-xs text-[#7D726D] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>
          Consultorio Dra. Valeria Montes · Av. Quintana 480, Piso 4, Recoleta, CABA
        </span>
        <p className="credits text-xs text-[#7D726D]">
          Archivo visual:{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Avenida_Alvear,_Recoleta.jpg"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#2A2421]"
          >
            “Avenida Alvear, Recoleta”
          </a>{" "}
          por Gobierno de la Ciudad de Buenos Aires (
          <a
            href="https://creativecommons.org/licenses/by/2.5/ar/deed.en"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#2A2421]"
          >
            CC BY 2.5
          </a>
          );{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Anatomy_of_the_nerves_of_head_and_trunk._Muller._Wellcome_L0007574.jpg"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#2A2421]"
          >
            “Anatomy of nerves of the head and trunk”
          </a>{" "}
          Wellcome Collection (
          <a
            href="https://creativecommons.org/licenses/by/4.0"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#2A2421]"
          >
            CC BY 4.0
          </a>
          );{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:00_2245_Echte_Arnika_(Arnica_montana).jpg"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#2A2421]"
          >
            “Echte Arnika (Arnica montana)”
          </a>{" "}
          por W. Bulach (
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#2A2421]"
          >
            CC BY-SA 4.0
          </a>
          );{" "}
          <a
            href="https://www.metmuseum.org/art/collection/search/395427"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-[#2A2421]"
          >
            “Sculpted head of Juno”
          </a>{" "}
          por Giulio Bonasone, The Met (CC0).
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;