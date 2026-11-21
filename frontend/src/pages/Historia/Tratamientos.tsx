import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  CheckCircle2,
  Clock,
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
}

interface IndicacionEstetica {
  id: string;
  etapa: "Pre-Cirugía" | "Post-Cirugía" | "Acompañamiento Diario";
  fechaInicio: string;
  indicacion: string;
  instruccionesDetalladas: string;
  frecuenciaDuracion: string;
  estado: "activo" | "completado";
}

const Tratamientos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [nuevaIndicacion, setNuevaIndicacion] = useState({
    etapa: "Post-Cirugía" as
      | "Pre-Cirugía"
      | "Post-Cirugía"
      | "Acompañamiento Diario",
    fechaInicio: new Date().toISOString().split("T")[0],
    indicacion: "",
    instruccionesDetalladas: "",
    frecuenciaDuracion: "",
    estado: "activo" as "activo" | "completado",
  });

  const [indicaciones, setIndicaciones] = useState<IndicacionEstetica[]>([
    {
      id: "1",
      etapa: "Post-Cirugía",
      fechaInicio: "2026-10-14",
      indicacion: "Compresas de gel frío y reposo con cabecera a 45°",
      instruccionesDetalladas:
        "Aplicar frío local en región malar sin presionar la férula nasal. Dormir en decúbito dorsal con doble almohada para favorecer el drenaje linfático.",
      frecuenciaDuracion: "15 min cada 3 hs · Durante 5 días",
      estado: "activo",
    },
    {
      id: "2",
      etapa: "Acompañamiento Diario",
      fechaInicio: "2026-10-16",
      indicacion: "Bruma termal descongestiva + emulsión reparadora con centella",
      instruccionesDetalladas:
        "Higienizar sin fricción y remitir fotografía de control matutino por mensajería clínica.",
      frecuenciaDuracion: "Cada 12 hs · Durante 30 días",
      estado: "activo",
    },
    {
      id: "3",
      etapa: "Pre-Cirugía",
      fechaInicio: "2026-09-28",
      indicacion: "Protocolo prequirúrgico: Árnica montana + suspensión de AINEs",
      instruccionesDetalladas:
        "Suspender ácido acetilsalicílico, ibuprofeno, vitamina E y tabaco 14 días antes de la intervención para reducir equimosis intraoperatoria.",
      frecuenciaDuracion: "14 días previos al quirófano",
      estado: "completado",
    },
  ]);

  useEffect(() => {
    if (location.state?.paciente) {
      setPaciente(location.state.paciente);
    } else {
      setPaciente({
        id: "1",
        dni: "38.492.104",
        apellido: "Quiroga",
        nombre: "Valentina",
        fechaNacimiento: "1994-05-14",
        telefono: "+54 9 11 6421-8890",
        email: "valentina.quiroga@arnet.com.ar",
      });
    }
  }, [location.state]);

  const handleAgregarIndicacion = () => {
    if (nuevaIndicacion.fechaInicio && nuevaIndicacion.indicacion) {
      const nuevoItem: IndicacionEstetica = {
        id: (indicaciones.length + 1).toString(),
        etapa: nuevaIndicacion.etapa,
        fechaInicio: nuevaIndicacion.fechaInicio,
        indicacion: nuevaIndicacion.indicacion,
        instruccionesDetalladas: nuevaIndicacion.instruccionesDetalladas,
        frecuenciaDuracion: nuevaIndicacion.frecuenciaDuracion || "Según evolución",
        estado: nuevaIndicacion.estado,
      };

      setIndicaciones([nuevoItem, ...indicaciones]);
      setNuevaIndicacion({
        etapa: "Post-Cirugía",
        fechaInicio: new Date().toISOString().split("T")[0],
        indicacion: "",
        instruccionesDetalladas: "",
        frecuenciaDuracion: "",
        estado: "activo",
      });
      setShowAddForm(false);
    }
  };

  if (!paciente) {
    return (
      <div className="p-8 text-center text-[#7D726D]">
        Cargando protocolo terapéutico...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DDD5]">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/historia", { state: { paciente } })}
            className="btn-secondary p-2 shrink-0 mt-0.5"
            aria-label="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
              Protocolo pre y postoperatorio
            </h1>
            <p className="num text-sm text-[#7D726D] mt-1">
              Paciente: {paciente.apellido}, {paciente.nombre} · DNI {paciente.dni} · 2 indicaciones activas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/mensajeria")}
            className="btn-secondary text-xs"
          >
            <MessageSquare className="w-4 h-4 text-[#7D726D]" />
            <span>Enviar por chat</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva indicación</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lista de indicaciones */}
        <div className="ledger-panel lg:col-span-8 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E8DDD5]">
            <h2 className="text-base font-semibold text-[#2A2421]">
              Esquema terapéutico de preparación y recuperación
            </h2>
          </div>

          <div className="divide-y divide-[#E8DDD5]">
            {indicaciones.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs ${
                        item.etapa === "Post-Cirugía"
                          ? "badge-blush"
                          : item.etapa === "Pre-Cirugía"
                          ? "badge-pending"
                          : "badge-active"
                      }`}
                    >
                      {item.etapa}
                    </span>
                    <span className="num text-xs text-[#7D726D]">
                      Inicio: {item.fechaInicio}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#2A2421]">
                    {item.indicacion}
                  </h3>
                  <p className="text-xs text-[#7D726D] leading-relaxed">
                    {item.instruccionesDetalladas}
                  </p>
                  <p className="num text-xs font-medium text-[#2A2421]">
                    Posología: {item.frecuenciaDuracion}
                  </p>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs ${
                      item.estado === "activo" ? "badge-active" : "badge-pending"
                    }`}
                  >
                    {item.estado === "activo" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Activo
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Completado
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lámina botánica de archivo: Arnica montana (Wikimedia Commons) */}
        <aside className="ledger-panel p-5 lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="pb-3 border-b border-[#E8DDD5]">
            <h2 className="text-base font-semibold text-[#2A2421]">
              Fitoterapia anti-equimosis
            </h2>
            <p className="text-xs text-[#7D726D] mt-0.5">
              Protocolo estándar pre y postquirúrgico del consultorio
            </p>
          </div>

          <figure className="space-y-2.5">
            <div className="overflow-hidden rounded-[6px] border border-[#E8DDD5] bg-[#FAF7F5]">
              <img
                src="/assets/00-2245-echte-arnika-arnica-montana.jpg"
                width={1280}
                height={854}
                alt="Espécimen botánico de Arnica montana empleada en protocolos anti-equimosis postoperatorios"
                className="w-full h-44 object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="text-xs text-[#7D726D] leading-relaxed">
              Las lactonas sesquiterpénicas de <em>Arnica montana</em> aceleran la reabsorción de hematomas periorbitarios. Fotografía: W. Bulach (
              <a
                href="https://commons.wikimedia.org/wiki/File:00_2245_Echte_Arnika_(Arnica_montana).jpg"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#2A2421]"
              >
                CC BY-SA 4.0
              </a>
              ).
            </figcaption>
          </figure>
        </aside>
      </div>

      {showAddForm && (
        <div
          data-ui="modal"
          className="fixed inset-0 bg-[#2A2421]/40 flex items-center justify-center z-50 p-4"
        >
          <div className="ledger-panel p-6 max-w-lg w-full animate-fade-in space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8DDD5]">
              <h3 className="text-base font-semibold text-[#2A2421]">
                Prescribir indicación clínica
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-[6px] text-[#7D726D] hover:text-[#2A2421] bg-[#FAF7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Etapa clínica
                  </label>
                  <select
                    value={nuevaIndicacion.etapa}
                    onChange={(e) =>
                      setNuevaIndicacion({
                        ...nuevaIndicacion,
                        etapa: e.target.value as any,
                      })
                    }
                    className="input-field"
                  >
                    <option value="Pre-Cirugía">Pre-Cirugía</option>
                    <option value="Post-Cirugía">Post-Cirugía</option>
                    <option value="Acompañamiento Diario">Acompañamiento Diario</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#7D726D] mb-1">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={nuevaIndicacion.fechaInicio}
                    onChange={(e) =>
                      setNuevaIndicacion({
                        ...nuevaIndicacion,
                        fechaInicio: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7D726D] mb-1">
                  Título de la indicación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Drenaje linfático asistido + cintas microporosas"
                  value={nuevaIndicacion.indicacion}
                  onChange={(e) =>
                    setNuevaIndicacion({
                      ...nuevaIndicacion,
                      indicacion: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7D726D] mb-1">
                  Instrucciones detalladas
                </label>
                <textarea
                  rows={3}
                  placeholder="Detallá cómo debe realizar el cuidado ambulatorio..."
                  value={nuevaIndicacion.instruccionesDetalladas}
                  onChange={(e) =>
                    setNuevaIndicacion({
                      ...nuevaIndicacion,
                      instruccionesDetalladas: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7D726D] mb-1">
                  Posología y duración
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cada 8 horas durante 7 días"
                  value={nuevaIndicacion.frecuenciaDuracion}
                  onChange={(e) =>
                    setNuevaIndicacion({
                      ...nuevaIndicacion,
                      frecuenciaDuracion: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E8DDD5]">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAgregarIndicacion}
                className="btn-primary text-xs"
              >
                Guardar indicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tratamientos;