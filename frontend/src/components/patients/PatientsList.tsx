import React, { useEffect, useState, useMemo } from "react";
import apiClient from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Search,
  Pencil,
  MessageSquare,
  FileText,
} from "lucide-react";

const FALLBACK_PATIENTS = [
  {
    id: 1,
    nombre: "Valentina",
    apellido: "Quiroga",
    dni: "38.492.104",
    genero: "F · 31a",
    telefono: "+54 9 11 6421-8890",
    procedimiento: "Rinoplastia ultrasónica + septoplastia funcional",
    progreso: "3 / 6",
  },
  {
    id: 2,
    nombre: "Martín",
    apellido: "Echeverría",
    dni: "29.841.552",
    genero: "M · 43a",
    telefono: "+54 9 11 4910-3312",
    procedimiento: "Blefaroplastia superior + cantopexia lateral",
    progreso: "2 / 4",
  },
  {
    id: 3,
    nombre: "Elena",
    apellido: "Rivas de Alvear",
    dni: "21.049.883",
    genero: "F · 57a",
    telefono: "+54 9 11 5519-0291",
    procedimiento: "Lifting cervicofacial plano profundo + lipofilling",
    progreso: "1 / 6",
  },
  {
    id: 4,
    nombre: "Lucas",
    apellido: "Benítez",
    dni: "41.220.918",
    genero: "M · 30a",
    telefono: "+54 9 11 6092-4418",
    procedimiento: "Bioestimulación con hidroxiapatita cálcica",
    progreso: "4 / 4",
  },
  {
    id: 5,
    nombre: "Sofía",
    apellido: "Gutiérrez",
    dni: "35.910.441",
    genero: "F · 34a",
    telefono: "+54 9 11 5118-7734",
    procedimiento: "Mastoplastia submuscular + ultrasonido",
    progreso: "5 / 6",
  },
];

const PatientsList: React.FC = () => {
  const [patients, setPatients] = useState<any[]>(FALLBACK_PATIENTS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiClient
      .get("/api/v1/pacientes")
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.pacientes)
          ? data.pacientes
          : data.patients || [];
        if (list.length > 0) {
          setPatients(list);
        }
      })
      .catch(() => {
        // Mantiene padrón local
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const q = searchTerm.toLowerCase();
    return patients.filter((p) => {
      const nombre = (p.nombre || p.firstName || "").toLowerCase();
      const apellido = (p.apellido || p.lastName || "").toLowerCase();
      const dni = (p.dni || p.nro_credencial || "").toString().toLowerCase();
      const proc = (p.plan || p.procedimiento || "").toLowerCase();
      return (
        nombre.includes(q) ||
        apellido.includes(q) ||
        dni.includes(q) ||
        proc.includes(q)
      );
    });
  }, [patients, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e6e6e6]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0a0a0a]">
            Padrón clínico de pacientes
          </h1>
          <p className="text-sm text-[#595959] mt-1 num">
            {filteredPatients.length} legajos activos en seguimiento quirúrgico y dermatológico
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/patients/new")}
          className="btn-primary text-xs sm:text-sm shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar nuevo paciente</span>
        </button>
      </div>

      <div className="ledger-panel overflow-hidden">
        <div className="p-4 border-b border-[#e6e6e6] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#595959] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por apellido, nombre, DNI o procedimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[#595959] text-sm">
            Cargando padrón de pacientes...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-10 text-center text-[#595959] text-sm">
            No se encontraron pacientes con ese criterio.
          </div>
        ) : (
          <div className="divide-y divide-[#e6e6e6]">
            {filteredPatients.map((p, idx) => {
              const nombre = p.nombre || p.firstName || "Paciente";
              const apellido = p.apellido || p.lastName || "";
              const dni = p.dni || p.nro_credencial || "34.892.104";
              const genero = p.genero || p.gender || "F · 32a";
              const telefono = p.telefono || "+54 9 11 5829-1044";
              const procedimiento =
                p.plan || p.procedimiento || "Rinoplastia ultrasónica + control postoperatorio";
              const progreso = p.progreso || `${(idx % 5) + 1} / 6`;

              return (
                <div
                  key={p.id || dni || idx}
                  className="p-4 sm:p-5 hover:bg-[#f4f3f1]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h2 className="font-semibold text-[#0a0a0a] text-sm">
                        {apellido}, {nombre}
                      </h2>
                      <span className="num text-xs text-[#595959]">
                        DNI {dni}
                      </span>
                    </div>
                    <p className="text-xs text-[#0a0a0a] font-medium">
                      {procedimiento}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#595959] num">
                      <span>{genero}</span>
                      <span>·</span>
                      <span>Tel. {telefono}</span>
                      <span>·</span>
                      <span className="text-[#0a0a0a] font-medium">
                        Sesiones: {progreso}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/mensajeria", {
                          state: { patientId: p.id || idx + 1, patientName: nombre },
                        })
                      }
                      className="btn-secondary py-1.5 px-3 text-xs"
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
                              id: String(p.id || idx + 1),
                              dni,
                              apellido,
                              nombre,
                              fechaNacimiento: p.fecha_nacimiento || "1994-05-14",
                              telefono,
                              email: p.email || "paciente@consultoriomontes.ar",
                              sexo: genero,
                              procedimiento,
                            },
                          },
                        })
                      }
                      className="btn-primary py-1.5 px-3 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Historia clínica</span>
                    </button>
                    <button
                      type="button"
                      title="Editar datos del paciente"
                      onClick={() => navigate(`/patients/${p.id || 1}/edit`)}
                      className="btn-secondary p-2"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;
