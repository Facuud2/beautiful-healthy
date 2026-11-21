import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api/axiosConfig";
import {
  Search,
  Layers,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

interface Paciente {
  id: string;
  dni: string;
  apellido: string;
  nombre: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  obraSocial?: string;
  domicilio?: string;
  sexo?: string;
  procedimiento?: string;
  etapa?: string;
}

const QUICK_PATIENTS: Paciente[] = [
  {
    id: "1",
    dni: "38.492.104",
    apellido: "Quiroga",
    nombre: "Valentina",
    fechaNacimiento: "1994-05-14",
    telefono: "+54 9 11 6421-8890",
    email: "valentina.quiroga@arnet.com.ar",
    obraSocial: "Cobertura Quirúrgica Integral",
    domicilio: "Av. Alvear 1840, Recoleta",
    sexo: "Femenino (31 años)",
    procedimiento: "Rinoplastia ultrasónica + septoplastia funcional",
    etapa: "Post-Op D+4",
  },
  {
    id: "2",
    dni: "29.841.552",
    apellido: "Echeverría",
    nombre: "Martín",
    fechaNacimiento: "1982-11-03",
    telefono: "+54 9 11 4910-3312",
    email: "m.echeverria@fibertel.com.ar",
    obraSocial: "Particular",
    domicilio: "Av. del Libertador 4420, Palermo Chico",
    sexo: "Masculino (43 años)",
    procedimiento: "Blefaroplastia superior + cantopexia lateral",
    etapa: "Post-Op D+6",
  },
  {
    id: "3",
    dni: "21.049.883",
    apellido: "Rivas de Alvear",
    nombre: "Elena",
    fechaNacimiento: "1968-08-22",
    telefono: "+54 9 11 5519-0291",
    email: "elena.rivas@consultoriomontes.ar",
    obraSocial: "Cobertura Quirúrgica Integral",
    domicilio: "Castex 3210, Palermo",
    sexo: "Femenino (57 años)",
    procedimiento: "Lifting cervicofacial plano profundo + lipofilling",
    etapa: "Post-Op D+2",
  },
];

const Historia = () => {
  const [apellido, setApellido] = useState("");
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(QUICK_PATIENTS[0]);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const apellidoRef = useRef<HTMLInputElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);
  const dniRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location.state?.paciente) {
      const p = location.state.paciente;
      const pacienteMapped: Paciente = {
        id: p.id || "1",
        dni: p.dni || p.nro_credencial || "38.492.104",
        apellido: p.apellido || "Quiroga",
        nombre: p.nombre || "Valentina",
        fechaNacimiento: p.fecha_nacimiento || p.fechaNacimiento || "1994-05-14",
        telefono: p.telefono || "+54 9 11 6421-8890",
        email: p.email || "valentina.quiroga@arnet.com.ar",
        obraSocial: p.obra_social || p.obraSocial || "Cobertura Quirúrgica Integral",
        domicilio: p.calle ? `${p.calle} ${p.numero || ""}` : p.domicilio || "Av. Alvear 1840",
        sexo: p.genero || p.sexo || "Femenino",
        procedimiento: p.procedimiento || "Rinoplastia ultrasónica + septoplastia funcional",
        etapa: p.etapa || "Post-Op D+4",
      };
      setApellido(p.apellido || "");
      setNombre(p.nombre || "");
      setDni(p.dni || p.nro_credencial || "");
      setPacienteEncontrado(pacienteMapped);
    }
  }, [location.state]);

  const handleKeyDown = (
    e: React.KeyboardEvent,
    nextRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      } else {
        buscarPaciente();
      }
    }
  };

  const buscarPaciente = async () => {
    setBuscando(true);
    setMensaje("");

    try {
      const res = await apiClient.get("/api/v1/pacientes/buscar", {
        params: {
          apellido: apellido.trim(),
          nombre: nombre.trim(),
          dni: dni.trim(),
        },
      });

      const list = Array.isArray(res.data) ? res.data : res.data.pacientes || [];
      let match = list.length > 0 ? list[0] : null;

      if (!match) {
        const allRes = await apiClient.get("/api/v1/pacientes");
        const allList = Array.isArray(allRes.data) ? allRes.data : allRes.data.pacientes || [];

        match = allList.find((p: any) => {
          const pDni = String(p.dni || p.nro_credencial || "").trim();
          const pAp = String(p.apellido || "").toLowerCase().trim();
          const pNom = String(p.nombre || "").toLowerCase().trim();

          const searchDni = dni.trim();
          const searchAp = apellido.toLowerCase().trim();
          const searchNom = nombre.toLowerCase().trim();

          if (searchDni && pDni.includes(searchDni)) return true;
          if (searchAp && searchNom && pAp.includes(searchAp) && pNom.includes(searchNom))
            return true;
          if (searchAp && !searchNom && !searchDni && pAp.includes(searchAp)) return true;
          if (searchNom && !searchAp && !searchDni && pNom.includes(searchNom)) return true;

          return false;
        });
      }

      if (match) {
        const pacienteMapped: Paciente = {
          id: match.id,
          dni: match.dni || match.nro_credencial || "",
          apellido: match.apellido || "",
          nombre: match.nombre || "",
          fechaNacimiento: match.fecha_nacimiento || match.fechaNacimiento || "",
          telefono: match.telefono || "+54 9 11 5402-9910",
          email: match.email || "contacto@consultoriomontes.ar",
          obraSocial: match.obra_social || "Particular",
          domicilio: match.calle ? `${match.calle} ${match.numero || ""}` : "Recoleta, CABA",
          sexo: match.genero || "Femenino",
          procedimiento: "Rinoplastia ultrasónica y seguimiento postoperatorio",
          etapa: "Post-Op",
        };
        setPacienteEncontrado(pacienteMapped);
      } else {
        const localMatch = QUICK_PATIENTS.find(
          (p) =>
            p.apellido.toLowerCase().includes(apellido.toLowerCase()) ||
            p.nombre.toLowerCase().includes(nombre.toLowerCase()) ||
            p.dni.includes(dni)
        );
        if (localMatch) {
          setPacienteEncontrado(localMatch);
        } else {
          setMensaje("No se encontró ningún paciente con los criterios ingresados.");
        }
      }
    } catch {
      const localMatch =
        QUICK_PATIENTS.find(
          (p) =>
            (apellido && p.apellido.toLowerCase().includes(apellido.toLowerCase())) ||
            (nombre && p.nombre.toLowerCase().includes(nombre.toLowerCase())) ||
            (dni && p.dni.includes(dni))
        ) || QUICK_PATIENTS[0];
      setPacienteEncontrado(localMatch);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-[#E8DDD5]">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
          Archivo de historias clínicas y protocolos
        </h1>
        <p className="text-sm text-[#7D726D] mt-1">
          Búsqueda por padrón quirúrgico, evolución por sesiones y esquemas de indicación
        </p>
      </div>

      {/* Buscador y selección rápida */}
      <div className="ledger-panel p-5 space-y-5">
        <div className="space-y-2">
          <span className="text-xs font-medium text-[#7D726D] block">
            Pacientes en seguimiento activo hoy:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PATIENTS.map((qp) => {
              const active = pacienteEncontrado?.id === qp.id;
              return (
                <button
                  key={qp.id}
                  type="button"
                  onClick={() => {
                    setPacienteEncontrado(qp);
                    setApellido(qp.apellido);
                    setNombre(qp.nombre);
                    setDni(qp.dni);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors border ${
                    active
                      ? "bg-[#C5A059] text-[#ffffff] border-[#C5A059]"
                      : "bg-[#FAF7F5] text-[#2A2421] border-[#E8DDD5] hover:border-[#2A2421]"
                  }`}
                >
                  <span>
                    {qp.apellido}, {qp.nombre}
                  </span>
                  <span
                    className={`num text-xs px-1.5 py-0.5 rounded-[4px] ${
                      active
                        ? "bg-[#262626] text-[#ffffff]"
                        : "bg-[#ffffff] text-[#7D726D] border border-[#E8DDD5]"
                    }`}
                  >
                    {qp.etapa}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#E8DDD5]">
          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Apellido
            </label>
            <input
              ref={apellidoRef}
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, nombreRef)}
              placeholder="Ej: Quiroga"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Nombre
            </label>
            <input
              ref={nombreRef}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, dniRef)}
              placeholder="Ej: Valentina"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              DNI / Pasaporte
            </label>
            <input
              ref={dniRef}
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, null)}
              placeholder="Ej: 38.492.104"
              className="input-field num"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={buscarPaciente}
            disabled={buscando}
            className="btn-primary text-xs"
          >
            <Search className="w-4 h-4" />
            <span>{buscando ? "Consultando padrón..." : "Localizar legajo"}</span>
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="p-4 rounded-[6px] bg-[#fef6e6] border border-[#f5deb3] text-[#7c4a03] text-sm font-medium">
          {mensaje}
        </div>
      )}

      {pacienteEncontrado && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="ledger-panel p-5 sm:p-6 lg:col-span-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD5]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#2A2421]">
                    {pacienteEncontrado.apellido}, {pacienteEncontrado.nombre}
                  </h2>
                  <span className="badge-active inline-flex items-center gap-1 px-2 py-0.5 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Seguimiento activo
                  </span>
                  {pacienteEncontrado.etapa && (
                    <span className="badge-pending num inline-flex items-center px-2 py-0.5 text-xs">
                      {pacienteEncontrado.etapa}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#2A2421] font-medium mt-1">
                  {pacienteEncontrado.procedimiento}
                </p>
                <p className="num text-xs text-[#7D726D] mt-0.5">
                  DNI {pacienteEncontrado.dni} · {pacienteEncontrado.sexo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF7F5]/60 p-4 rounded-[6px] border border-[#E8DDD5]">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#7D726D] shrink-0" />
                <div>
                  <span className="text-xs text-[#7D726D] block">Nacimiento</span>
                  <span className="num text-xs font-semibold text-[#2A2421]">
                    {pacienteEncontrado.fechaNacimiento || "1994-05-14"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#7D726D] shrink-0" />
                <div>
                  <span className="text-xs text-[#7D726D] block">Teléfono directo</span>
                  <span className="num text-xs font-semibold text-[#2A2421]">
                    {pacienteEncontrado.telefono}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#7D726D] shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs text-[#7D726D] block">Cobertura / Correo</span>
                  <span className="text-xs font-semibold text-[#2A2421] truncate block">
                    {pacienteEncontrado.obraSocial || pacienteEncontrado.email}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-[#7D726D] mb-3">
                Módulos del legajo quirúrgico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/historia-clinica", { state: { paciente: pacienteEncontrado } })
                  }
                  className="interactive-card p-4 text-left flex flex-col justify-between gap-3"
                >
                  <Layers className="w-4 h-4 text-[#2A2421]" />
                  <div>
                    <h4 className="font-semibold text-[#2A2421] text-sm flex items-center justify-between">
                      <span>Actas por sesión</span>
                      <ArrowRight className="w-4 h-4 text-[#7D726D]" />
                    </h4>
                    <p className="text-xs text-[#7D726D] mt-1 leading-relaxed">
                      Curva de resolución de edema, simetría y evolución cicatrizal.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/tratamientos", { state: { paciente: pacienteEncontrado } })
                  }
                  className="interactive-card p-4 text-left flex flex-col justify-between gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1b6e3c]" />
                  <div>
                    <h4 className="font-semibold text-[#2A2421] text-sm flex items-center justify-between">
                      <span>Protocolo Pre/Post-Op</span>
                      <ArrowRight className="w-4 h-4 text-[#7D726D]" />
                    </h4>
                    <p className="text-xs text-[#7D726D] mt-1 leading-relaxed">
                      Esquema de preparación, crioterapia y cuidado dermoestético.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/mensajeria")}
                  className="interactive-card p-4 text-left flex flex-col justify-between gap-3"
                >
                  <MessageSquare className="w-4 h-4 text-[#1d5fbf]" />
                  <div>
                    <h4 className="font-semibold text-[#2A2421] text-sm flex items-center justify-between">
                      <span>Mensajería directa</span>
                      <ArrowRight className="w-4 h-4 text-[#7D726D]" />
                    </h4>
                    <p className="text-xs text-[#7D726D] mt-1 leading-relaxed">
                      Envío de indicaciones y recepción de fotografías de control.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Grabado clásico de proporciones craneofaciales (The Met CC0) */}
          <aside className="ledger-panel p-5 lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="pb-3 border-b border-[#E8DDD5]">
              <h2 className="text-base font-semibold text-[#2A2421]">
                Estudio de proporciones faciales
              </h2>
              <p className="text-xs text-[#7D726D] mt-0.5">
                Canon de tercios craneofaciales y proyección nasolabial
              </p>
            </div>

            <figure className="space-y-2.5">
              <div className="overflow-hidden rounded-[6px] border border-[#E8DDD5] bg-[#FAF7F5] max-h-56">
                <img
                  src="/assets/sculpted-head-of-juno.jpg"
                  width={2381}
                  height={3036}
                  alt="Grabado renacentista de cabeza esculpida de Juno por Giulio Bonasone en The Metropolitan Museum of Art"
                  className="w-full h-56 object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="text-xs text-[#7D726D] leading-relaxed">
                “Sculpted head of Juno”, Giulio Bonasone (ca. 1531–76), colección{" "}
                <a
                  href="https://www.metmuseum.org/art/collection/search/395427"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-[#2A2421]"
                >
                  The Metropolitan Museum of Art (CC0)
                </a>
                .
              </figcaption>
            </figure>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Historia;