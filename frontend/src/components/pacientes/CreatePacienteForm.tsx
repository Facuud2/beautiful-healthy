import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CreatePacienteRequest } from "../../types/pacientes";
import toast from "react-hot-toast";
import apiClient from "../../api/axiosConfig";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface CreatePacienteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreatePacienteForm: React.FC<CreatePacienteFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const initialState = {
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    dni: "",
    genero: "",
    calle: "",
    numero: "",
    localidad: "",
    codigo_postal: "",
    telefono: "",
    nro_credencial: "",
    obra_social: "",
    plan: "",
    creado_por_usuario: "",
    consultorio_id: "",
  };

  const [formData, setFormData] = useState<CreatePacienteRequest>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      apiClient
        .get(`/api/v1/pacientes/${id}`)
        .then((res) => {
          const p = res.data.paciente || res.data;
          if (p) {
            setFormData({
              nombre: p.nombre || "",
              apellido: p.apellido || "",
              fecha_nacimiento: p.fecha_nacimiento
                ? String(p.fecha_nacimiento).slice(0, 10)
                : "",
              dni: p.dni || p.nro_credencial || "",
              genero: p.genero || "",
              calle: p.calle || "",
              numero: p.numero || "",
              localidad: p.localidad || "",
              codigo_postal: p.codigo_postal || "",
              telefono: p.telefono || "",
              nro_credencial: p.nro_credencial || p.dni || "",
              obra_social: p.obra_social || "",
              plan: p.plan || "",
              creado_por_usuario: p.creado_por_usuario || "",
              consultorio_id: p.consultorio_id || "",
            });
          }
        })
        .catch(() => {
          toast.error("No se pudo cargar la ficha del paciente");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await apiClient.put(`/api/v1/pacientes/${id}`, formData);
        toast.success("Datos del paciente actualizados con éxito");
      } else {
        await apiClient.post("/api/v1/pacientes", formData);
        setFormData(initialState);
        toast.success("Paciente registrado correctamente");
      }
      onSuccess();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Error al guardar la ficha del paciente"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-3 pb-4 border-b border-[#e6e6e6]">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary p-2 shrink-0 mt-0.5"
          title="Volver"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0a0a0a]">
            {isEditing ? "Editar legajo del paciente" : "Alta de legajo clínico"}
          </h1>
          <p className="text-sm text-[#595959] mt-1">
            Registro filiatorio, domicilio y procedimiento quirúrgico o dermatológico
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#fef6e6] border border-[#f5deb3] text-[#7c4a03] rounded-[6px] text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="ledger-panel p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#e6e6e6]">
            <h2 className="text-sm font-semibold text-[#0a0a0a]">
              Datos filiatorios del paciente
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Valentina"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                placeholder="Ej: Quiroga"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                DNI / Pasaporte
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni || ""}
                onChange={handleChange}
                placeholder="Ej: 38.492.104"
                className="input-field num"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Fecha de nacimiento *
              </label>
              <input
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                required
                className="input-field num"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Género
              </label>
              <select
                name="genero"
                value={formData.genero || ""}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Seleccione género</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="No binario">No binario</option>
                <option value="Otro">Prefiero no especificar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Teléfono móvil
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono || ""}
                onChange={handleChange}
                placeholder="Ej: +54 9 11 6421-8890"
                className="input-field num"
              />
            </div>
          </div>
        </div>

        <div className="ledger-panel p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#e6e6e6]">
            <h2 className="text-sm font-semibold text-[#0a0a0a]">
              Domicilio y localidad
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Calle / Avenida
              </label>
              <input
                type="text"
                name="calle"
                value={formData.calle || ""}
                onChange={handleChange}
                placeholder="Ej: Av. Alvear"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Número / Piso
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero || ""}
                onChange={handleChange}
                placeholder="Ej: 1840 4°B"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#595959] mb-1.5">
                Barrio / Localidad
              </label>
              <input
                type="text"
                name="localidad"
                value={formData.localidad || ""}
                onChange={handleChange}
                placeholder="Ej: Recoleta"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="ledger-panel p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-[#e6e6e6]">
            <h2 className="text-sm font-semibold text-[#0a0a0a]">
              Procedimiento principal o motivo clínico
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#595959] mb-1.5">
              Procedimiento indicado
            </label>
            <input
              type="text"
              name="plan"
              value={formData.plan || ""}
              onChange={handleChange}
              placeholder="Ej: Rinoplastia ultrasónica + septoplastia funcional"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary text-xs sm:text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs sm:text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {loading
                ? "Guardando..."
                : isEditing
                ? "Guardar cambios"
                : "Registrar paciente"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePacienteForm;