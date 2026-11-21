import { useState, useEffect, useRef, useMemo } from "react";
import apiClient from "../api/axiosConfig";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  User,
  X,
  Calendar,
  MessageCircleHeart,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Consulta {
  id: string;
  medico: string;
  medicoApellido: string;
  fecha: string;
  motivo: string;
  paciente: string;
  pacienteApellido: string;
  dni: string;
  diagnostico?: string;
  tratamiento?: string;
  estado: "pendiente" | "resuelta";
}

interface RegisteredPatientOption {
  id: string | number;
  nombre: string;
  apellido: string;
  dni: string;
}

const DEFAULT_REGISTERED_PATIENTS: RegisteredPatientOption[] = [
  { id: "1", nombre: "Valentina", apellido: "Montes", dni: "38.492.104" },
  { id: "2", nombre: "Martín", apellido: "Echeverría", dni: "29.841.552" },
  { id: "3", nombre: "Elena", apellido: "Rivas de Alvear", dni: "21.049.883" },
  { id: "4", nombre: "Lucas", apellido: "Benítez", dni: "41.220.918" },
  { id: "5", nombre: "Sofía", apellido: "Gutiérrez", dni: "35.910.441" },
];

const QUICK_DATES = [
  "Hoy",
  "Mañana",
  "Lunes 20 Oct",
  "Martes 21 Oct",
  "Miércoles 22 Oct",
  "Jueves 23 Oct",
  "Viernes 24 Oct",
  "Lunes 27 Oct",
];

const QUICK_TIMES = [
  "09:00 hs",
  "09:30 hs",
  "10:00 hs",
  "10:30 hs",
  "11:00 hs",
  "12:00 hs",
  "15:00 hs",
  "16:00 hs",
  "17:00 hs",
  "18:00 hs",
];

export const AGENDADAS_STORAGE_KEY = "beautiful_health_sesiones_agendadas";

const FALLBACK_SESIONES: Consulta[] = [
  {
    id: "101",
    medico: "Valeria",
    medicoApellido: "Montes",
    fecha: "Hoy, 10:30 hs",
    motivo: "Control evolutivo • Retiro de férula nasal y ultrasonido",
    paciente: "Valentina",
    pacienteApellido: "Montes",
    dni: "38.492.104",
    diagnostico:
      "Edema en reducción (20%), dorso nasal simétrico y cicatriz limpia.",
    tratamiento:
      "Iniciar cintas microporosas nocturnas y continuar drenaje linfático asistido.",
    estado: "pendiente",
  },
  {
    id: "102",
    medico: "Valeria",
    medicoApellido: "Montes",
    fecha: "Hoy, 12:00 hs",
    motivo: "Control de Blefaroplastia Superior y marcación mandibular",
    paciente: "Martín",
    pacienteApellido: "Echeverría",
    dni: "29.841.552",
    diagnostico:
      "Equimosis mínima en párpado superior; contorno mandibular definido.",
    tratamiento:
      "Aplicar gel descongestivo frío cada 4 hs y gotas oftálmicas lubricantes.",
    estado: "pendiente",
  },
  {
    id: "103",
    medico: "Valeria",
    medicoApellido: "Montes",
    fecha: "Hoy, 15:30 hs",
    motivo: "Consulta de valoración y planificación • Lifting Deep Plane",
    paciente: "Elena",
    pacienteApellido: "Rivas de Alvear",
    dni: "21.049.883",
    diagnostico:
      "Piel preparada con antioxidantes tópicos; vectores de tensión planificados.",
    tratamiento:
      "Iniciar Árnica sublingual 5 días antes y suspender antiinflamatorios.",
    estado: "resuelta",
  },
  {
    id: "104",
    medico: "Valeria",
    medicoApellido: "Montes",
    fecha: "Ayer, 17:00 hs",
    motivo: "Control de simetría y bioestimulación con hidroxiapatita",
    paciente: "Lucas",
    pacienteApellido: "Benítez",
    dni: "41.220.918",
    diagnostico:
      "Proyección mentoniana y ángulo gonial en armonía; evolución óptima.",
    tratamiento:
      "Hidratación con ácido hialurónico tópico y protector solar SPF 50+.",
    estado: "resuelta",
  },
];

const Consultas = () => {
  const navigate = useNavigate();
  const [registeredPatients, setRegisteredPatients] = useState<RegisteredPatientOption[]>(
    DEFAULT_REGISTERED_PATIENTS
  );
  const [pacienteSearch, setPacienteSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [pacienteSelected, setPacienteSelected] = useState<RegisteredPatientOption | null>(null);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

  const [consultas, setConsultas] = useState<Consulta[]>(() => {
    try {
      const saved = localStorage.getItem(AGENDADAS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return FALLBACK_SESIONES;
  });

  const [loading, setLoading] = useState(true);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [selectedQuickDate, setSelectedQuickDate] = useState<string>("Mañana");
  const [selectedQuickTime, setSelectedQuickTime] = useState<string>("10:00 hs");

  const [activeTab, setActiveTab] = useState<"todas" | "pendientes" | "resueltas">(
    "todas"
  );
  const [createData, setCreateData] = useState({
    medico: "Valeria",
    medicoApellido: "Montes",
    motivo: "",
    fecha: "",
    indicaciones: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    diagnostico: "",
    tratamiento: "",
  });

  // Sync consultas with localStorage so Patient Portal can read scheduled sessions & indications
  useEffect(() => {
    try {
      localStorage.setItem(AGENDADAS_STORAGE_KEY, JSON.stringify(consultas));
      window.dispatchEvent(new Event("beautiful-health-sessions-updated"));
    } catch {
      // ignore
    }
  }, [consultas]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        patientDropdownRef.current &&
        !patientDropdownRef.current.contains(e.target as Node)
      ) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Load patients for the dropdown
    apiClient
      .get("/api/v1/pacientes")
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : data.pacientes || data.patients || [];
        if (list.length > 0) {
          const mapped: RegisteredPatientOption[] = list.map((p: any, idx: number) => ({
            id: p.id || idx + 10,
            nombre: p.nombre || p.firstName || "Paciente",
            apellido: p.apellido || p.lastName || "",
            dni: p.dni || p.nro_credencial || "—",
          }));
          const combined = [...DEFAULT_REGISTERED_PATIENTS];
          mapped.forEach((mp) => {
            if (!combined.some((c) => c.dni === mp.dni)) {
              combined.push(mp);
            }
          });
          setRegisteredPatients(combined);
        }
      })
      .catch(() => {
        // Keep default registered patients
      });
  }, []);

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const res = await apiClient.get("/api/v1/consultas");
        const data = res.data;
        if (Array.isArray(data) && data.length > 0) {
          const consultasMapeadas: Consulta[] = data.map((c: any, idx: number) => ({
            id: String(c.id || idx + 1),
            medico: c.medico_nombre || "Valeria",
            medicoApellido: c.medico_apellido || "Montes",
            fecha: c.fecha ? new Date(c.fecha).toLocaleString() : "Hoy, 11:00 hs",
            motivo: c.motivo || "Control evolutivo en consultorio",
            paciente: c.paciente_nombre || "Valentina",
            pacienteApellido: c.paciente_apellido || "Montes",
            dni: c.dni || "38.492.104",
            estado: c.estado === "resuelta" ? "resuelta" : "pendiente",
            diagnostico:
              c.diagnostico ||
              "Evolución favorable con reducción sostenida de la inflamación.",
            tratamiento:
              c.tratamiento ||
              "Continuar con las indicaciones asignadas y control por chat.",
          }));
          setConsultas(consultasMapeadas);
        }
      } catch {
        // Keeps stored or fallback sessions
      } finally {
        setLoading(false);
      }
    };
    fetchConsultas();
  }, []);

  const filteredPatientOptions = useMemo(() => {
    if (!pacienteSearch.trim()) return registeredPatients;
    const q = pacienteSearch.toLowerCase();
    return registeredPatients.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.apellido.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q)
    );
  }, [registeredPatients, pacienteSearch]);

  const handleVerMas = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setEditData({
      diagnostico: consulta.diagnostico || "",
      tratamiento: consulta.tratamiento || "",
    });
    setShowModal(true);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedConsulta(null);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (selectedConsulta) {
      const updated = consultas.map((c) =>
        c.id === selectedConsulta.id
          ? {
              ...c,
              diagnostico: editData.diagnostico,
              tratamiento: editData.tratamiento,
              estado: "resuelta" as const,
            }
          : c
      );
      setConsultas(updated);
      setSelectedConsulta({
        ...selectedConsulta,
        diagnostico: editData.diagnostico,
        tratamiento: editData.tratamiento,
        estado: "resuelta",
      });
      setIsEditing(false);
      toast.success("Sesión actualizada");
    }
  };

  const handleConfirmDateTime = () => {
    setCreateData((prev) => ({
      ...prev,
      fecha: `${selectedQuickDate}, ${selectedQuickTime}`,
    }));
    setShowDateTimeModal(false);
  };

  const handleCreateConsulta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSelected) {
      toast.error("Seleccioná un paciente de la lista");
      return;
    }
    if (!createData.motivo.trim()) {
      toast.error("Ingresá el motivo de la sesión");
      return;
    }

    const nueva: Consulta = {
      id: String(Date.now()),
      medico: createData.medico || "Valeria",
      medicoApellido: createData.medicoApellido || "Montes",
      fecha: createData.fecha || `${selectedQuickDate}, ${selectedQuickTime}`,
      motivo: createData.motivo.trim(),
      paciente: pacienteSelected.nombre,
      pacienteApellido: pacienteSelected.apellido,
      dni: pacienteSelected.dni,
      estado: "pendiente",
      diagnostico: "Pendiente de evaluación en consultorio.",
      tratamiento:
        createData.indicaciones.trim() ||
        "Asistir puntualmente al consultorio según lo acordado.",
    };
    setConsultas([nueva, ...consultas]);
    setShowCreateModal(false);
    setCreateData({
      medico: "Valeria",
      medicoApellido: "Montes",
      motivo: "",
      fecha: "",
      indicaciones: "",
    });
    setPacienteSelected(null);
    setPacienteSearch("");
    toast.success("Sesión agendada correctamente");
  };

  const filteredConsultas = consultas.filter((c) => {
    if (activeTab === "pendientes") return c.estado === "pendiente";
    if (activeTab === "resueltas") return c.estado === "resuelta";
    return true;
  });

  const pendientesCount = consultas.filter((c) => c.estado === "pendiente").length;
  const resueltasCount = consultas.filter((c) => c.estado === "resuelta").length;

  if (loading) {
    return (
      <div className="p-12 text-center text-[#7D726D] flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        <span>Cargando agenda de sesiones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera de lienzo: Un único h1 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DDD5]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
            Agenda de sesiones y controles quirúrgicos
          </h1>
          <p className="num text-sm text-[#7D726D] mt-1">
            {pendientesCount} turnos programados · {resueltasCount} sesiones completadas en la cohorte activa
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-xs sm:text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar nueva sesión</span>
        </button>
      </div>

      {/* Pestañas de filtro */}
      <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-[6px] bg-[#eae8e3] border border-[#E8DDD5]">
        <button
          type="button"
          onClick={() => setActiveTab("todas")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors num ${
            activeTab === "todas"
              ? "bg-[#ffffff] text-[#2A2421]"
              : "text-[#7D726D] hover:text-[#2A2421]"
          }`}
        >
          Todas las sesiones ({consultas.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pendientes")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1.5 num ${
            activeTab === "pendientes"
              ? "bg-[#ffffff] text-[#2A2421]"
              : "text-[#7D726D] hover:text-[#2A2421]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Programadas ({pendientesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("resueltas")}
          className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors flex items-center gap-1.5 num ${
            activeTab === "resueltas"
              ? "bg-[#ffffff] text-[#2A2421]"
              : "text-[#7D726D] hover:text-[#2A2421]"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completadas ({resueltasCount})</span>
        </button>
      </div>

      {/* Tabla / Lista principal */}
      <div className="ledger-panel overflow-hidden">
        {filteredConsultas.length === 0 ? (
          <div className="py-12 text-center text-[#7D726D] text-sm flex flex-col items-center justify-center">
            <CalendarCheck className="w-8 h-8 text-[#7D726D] mb-2" />
            <p className="font-semibold text-[#2A2421]">
              No hay sesiones registradas en este filtro
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8DDD5]">
            {filteredConsultas.map((consulta) => (
              <div
                key={consulta.id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF7F5]/50 transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="num inline-flex items-center gap-1.5 text-xs font-semibold text-[#2A2421]">
                      <Calendar className="w-3.5 h-3.5 text-[#7D726D]" />
                      {consulta.fecha}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs ${
                        consulta.estado === "pendiente"
                          ? "badge-pending"
                          : "badge-active"
                      }`}
                    >
                      {consulta.estado === "pendiente" ? (
                        <>
                          <Clock className="w-3 h-3" />
                          Programada
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Completada
                        </>
                      )}
                    </span>
                  </div>

                  <h2 className="text-sm font-semibold text-[#2A2421]">
                    {consulta.pacienteApellido}, {consulta.paciente}{" "}
                    <span className="num text-xs font-normal text-[#7D726D]">
                      (DNI {consulta.dni})
                    </span>
                  </h2>
                  <p className="text-xs text-[#7D726D]">
                    <strong className="text-[#2A2421] font-medium">Procedimiento / Motivo:</strong>{" "}
                    {consulta.motivo}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate("/mensajeria")}
                    className="btn-secondary py-1.5 px-3 text-xs"
                  >
                    <MessageCircleHeart className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerMas(consulta)}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    <span>Ver ficha e indicaciones</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalle de Sesión */}
      {showModal && selectedConsulta && (
        <div
          data-ui="modal"
          className="fixed inset-0 bg-[#2A2421]/40 flex items-center justify-center z-50 p-4"
        >
          <div className="ledger-panel p-6 max-w-lg w-full space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E8DDD5]">
              <div>
                <span className="num text-xs font-medium text-[#7D726D] block">
                  Sesión · {selectedConsulta.fecha}
                </span>
                <h3 className="text-base font-semibold text-[#2A2421] mt-0.5">
                  {selectedConsulta.pacienteApellido}, {selectedConsulta.paciente}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-[6px] text-[#7D726D] hover:text-[#2A2421] bg-[#FAF7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-[6px] bg-[#FAF7F5] border border-[#E8DDD5]">
                <span className="font-medium text-[#7D726D] block mb-1">
                  Motivo clínico:
                </span>
                <p className="text-[#2A2421] font-medium">
                  {selectedConsulta.motivo}
                </p>
              </div>

              <div>
                <label className="block font-medium text-[#7D726D] mb-1.5">
                  Evaluación de la sesión
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editData.diagnostico}
                    onChange={(e) =>
                      setEditData({ ...editData, diagnostico: e.target.value })
                    }
                    className="input-field"
                  />
                ) : (
                  <div className="p-3 rounded-[6px] bg-[#FAF7F5] border border-[#E8DDD5] text-[#2A2421]">
                    {selectedConsulta.diagnostico || "Sin observaciones."}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-[#7D726D] mb-1.5">
                  Indicaciones asignadas al paciente
                </label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={editData.tratamiento}
                    onChange={(e) =>
                      setEditData({ ...editData, tratamiento: e.target.value })
                    }
                    className="input-field"
                  />
                ) : (
                  <div className="p-3 rounded-[6px] bg-[#FAF7F5] border border-[#E8DDD5] text-[#2A2421]">
                    {selectedConsulta.tratamiento || "Sin indicaciones."}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E8DDD5]">
              {!isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary text-xs"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="btn-primary text-xs"
                  >
                    Editar notas e indicaciones
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="btn-primary text-xs"
                  >
                    Guardar y marcar completada
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Agendar Nueva Sesión */}
      {showCreateModal && (
        <div
          data-ui="modal"
          className="fixed inset-0 bg-[#2A2421]/40 flex items-center justify-center z-50 p-4"
        >
          <form
            onSubmit={handleCreateConsulta}
            className="ledger-panel p-6 max-w-lg w-full space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD5]">
              <h3 className="text-base font-semibold text-[#2A2421]">
                Agendar nueva sesión
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-[6px] text-[#7D726D] hover:text-[#2A2421] bg-[#FAF7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative" ref={patientDropdownRef}>
                <label className="block text-xs font-medium text-[#7D726D] mb-1">
                  Paciente registrado *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por apellido o DNI..."
                    value={pacienteSearch}
                    onFocus={() => setShowPatientDropdown(true)}
                    onClick={() => setShowPatientDropdown(true)}
                    onChange={(e) => {
                      setPacienteSearch(e.target.value);
                      setPacienteSelected(null);
                      setShowPatientDropdown(true);
                    }}
                    className="input-field pr-9"
                  />
                  <ChevronDown className="w-4 h-4 text-[#7D726D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {showPatientDropdown && (
                  <div
                    data-ui="dropdown"
                    className="absolute z-30 left-0 right-0 mt-1 bg-[#ffffff] border border-[#E8DDD5] rounded-[6px] max-h-48 overflow-y-auto divide-y divide-[#E8DDD5]"
                  >
                    {filteredPatientOptions.length > 0 ? (
                      filteredPatientOptions.map((p) => (
                        <button
                          type="button"
                          key={`${p.id}-${p.dni}`}
                          onClick={() => {
                            setPacienteSelected(p);
                            setPacienteSearch(
                              `${p.apellido}, ${p.nombre} (DNI: ${p.dni})`
                            );
                            setShowPatientDropdown(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#FAF7F5] text-[#2A2421] flex items-center justify-between gap-2 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <User className="w-3.5 h-3.5 text-[#7D726D] shrink-0" />
                            <span className="font-semibold truncate">
                              {p.apellido}, {p.nombre}
                            </span>
                          </div>
                          <span className="num text-xs text-[#7D726D] shrink-0">
                            DNI {p.dni}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3.5 py-3 text-xs text-[#7D726D] text-center">
                        No se encontraron pacientes
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Motivo clínico *
                  </label>
                  <input
                    type="text"
                    required
                    value={createData.motivo}
                    onChange={(e) =>
                      setCreateData({ ...createData, motivo: e.target.value })
                    }
                    placeholder="Ej: Control D+7, Retiro de férula..."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Fecha y hora *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDateTimeModal(true)}
                    className="input-field text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className={createData.fecha ? "text-[#2A2421] font-medium num" : "text-[#7D726D]"}>
                      {createData.fecha || "Elegir día y horario..."}
                    </span>
                    <Calendar className="w-4 h-4 text-[#7D726D] shrink-0" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7D726D] mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#7D726D]" />
                  <span>Indicaciones previas para esta sesión</span>
                </label>
                <textarea
                  rows={3}
                  value={createData.indicaciones}
                  onChange={(e) =>
                    setCreateData({ ...createData, indicaciones: e.target.value })
                  }
                  placeholder="Ej: Asistir sin maquillaje ni cremas. Traer férula de contención."
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E8DDD5]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary text-xs">
                Confirmar sesión
              </button>
            </div>
          </form>
        </div>
      )}

      {showDateTimeModal && (
        <div
          data-ui="modal"
          className="fixed inset-0 bg-[#2A2421]/40 flex items-center justify-center z-[60] p-4"
        >
          <div className="ledger-panel p-5 sm:p-6 max-w-md w-full space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD5]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2A2421]" />
                <h4 className="text-sm font-semibold text-[#2A2421]">
                  Seleccionar fecha y horario
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDateTimeModal(false)}
                className="p-1 rounded-[4px] text-[#7D726D] hover:text-[#2A2421] bg-[#FAF7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="block text-xs font-medium text-[#7D726D] mb-2">
                  1. Elegí el día
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_DATES.map((day) => {
                    const active = selectedQuickDate === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedQuickDate(day)}
                        className={`px-3 py-2 rounded-[6px] text-xs font-medium border transition-colors text-center ${
                          active
                            ? "bg-[#C5A059] text-[#ffffff] border-[#C5A059]"
                            : "bg-[#FAF7F5] text-[#2A2421] border-[#E8DDD5] hover:border-[#2A2421]"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#7D726D] mb-2">
                  2. Elegí el horario
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {QUICK_TIMES.map((time) => {
                    const active = selectedQuickTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedQuickTime(time)}
                        className={`num px-2 py-2 rounded-[6px] text-xs font-medium border transition-colors text-center ${
                          active
                            ? "bg-[#C5A059] text-[#ffffff] border-[#C5A059]"
                            : "bg-[#FAF7F5] text-[#2A2421] border-[#E8DDD5] hover:border-[#2A2421]"
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8DDD5] flex items-center justify-between gap-3">
              <div className="text-xs text-[#7D726D] num">
                Turno:{" "}
                <strong className="text-[#2A2421]">
                  {selectedQuickDate}, {selectedQuickTime}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleConfirmDateTime}
                className="btn-primary text-xs py-2 px-4"
              >
                Confirmar horario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultas;