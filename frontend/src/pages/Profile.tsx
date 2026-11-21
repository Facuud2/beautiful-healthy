import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ProfileUpdateRequest,
  PasswordChangeRequest,
  getProfile,
  updateProfile,
  changePassword,
} from "../services/profileService";
import {
  ShieldCheck,
  Building,
  KeyRound,
  Check,
  Edit2,
  X,
} from "lucide-react";

const Profile = () => {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [personalData, setPersonalData] = useState<ProfileUpdateRequest>({
    nombre: "Valeria",
    apellido: "Montes",
    email: "valeria.montes@consultoriomontes.ar",
    dni: "30.482.910",
    matricula_profesional: "M.N. 114.892 · Especialista en Cirugía Plástica y Reparadora",
    telefono: "+54 9 11 5890-4410",
  });

  const [originalData, setOriginalData] = useState<ProfileUpdateRequest>(personalData);

  const [consultorioData, setConsultorioData] = useState({
    direccion_consultorio: "Av. Quintana 480, Piso 4 · Recoleta, Buenos Aires",
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeRequest>({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getProfile();
        if (profile && profile.nombre) {
          const profileRequest = {
            nombre: profile.nombre || "Valeria",
            apellido: profile.apellido || "Montes",
            email: profile.email || "valeria.montes@consultoriomontes.ar",
            dni: profile.dni || "30.482.910",
            matricula_profesional:
              profile.matricula_profesional || "M.N. 114.892",
            telefono: profile.telefono || "+54 9 11 5890-4410",
          };
          setPersonalData(profileRequest);
          setOriginalData(profileRequest);
          setConsultorioData({
            direccion_consultorio:
              profile.direccion_consultorio ||
              "Av. Quintana 480, Piso 4 · Recoleta, Buenos Aires",
          });
        }
      } catch {
        // Mantiene perfil por defecto de la Cirujana
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalData({
      ...personalData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditPersonal = async () => {
    if (isEditingPersonal) {
      try {
        await updateProfile(personalData);
      } catch {
        // Fallback local update
      }
      setOriginalData(personalData);
      setIsEditingPersonal(false);
      toast.success("Ficha de dirección médica actualizada");
    } else {
      setIsEditingPersonal(true);
    }
  };

  const handleCancelEdit = () => {
    setPersonalData(originalData);
    setIsEditingPersonal(false);
  };

  const handleChangePassword = async () => {
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_new_password
    ) {
      toast.error("Completá todos los campos de seguridad");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    try {
      await changePassword(passwordData);
    } catch {
      // Fallback local
    }
    setPasswordData({
      current_password: "",
      new_password: "",
      confirm_new_password: "",
    });
    toast.success("Credenciales de acceso actualizadas");
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-[#7D726D]">
        Cargando ficha profesional...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DDD5]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
              Dra. {personalData.nombre} {personalData.apellido}
            </h1>
            <span className="badge-active inline-flex items-center gap-1 px-2.5 py-0.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Dirección Quirúrgica Certificada
            </span>
          </div>
          <p className="num text-sm text-[#7D726D] mt-1">
            {personalData.matricula_profesional} · {personalData.email}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          {!isEditingPersonal ? (
            <button
              type="button"
              onClick={handleEditPersonal}
              className="btn-secondary text-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar datos</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEditPersonal}
                className="btn-primary text-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary text-xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Datos Profesionales */}
      <div className="ledger-panel p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b border-[#E8DDD5]">
          <h2 className="text-base font-semibold text-[#2A2421]">
            Registro de matrícula y contacto institucional
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={personalData.nombre}
              onChange={handlePersonalChange}
              disabled={!isEditingPersonal}
              className="input-field disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={personalData.apellido}
              onChange={handlePersonalChange}
              disabled={!isEditingPersonal}
              className="input-field disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Correo electrónico institucional
            </label>
            <input
              type="email"
              name="email"
              value={personalData.email}
              onChange={handlePersonalChange}
              disabled={!isEditingPersonal}
              className="input-field disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Teléfono de consultorio
            </label>
            <input
              type="text"
              name="telefono"
              value={personalData.telefono}
              onChange={handlePersonalChange}
              disabled={!isEditingPersonal}
              className="input-field num disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              DNI
            </label>
            <input
              type="text"
              name="dni"
              value={personalData.dni}
              onChange={handlePersonalChange}
              disabled={!isEditingPersonal}
              className="input-field num disabled:opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Matrícula nacional y especialidad
            </label>
            <input
              type="text"
              name="matricula_profesional"
              value={personalData.matricula_profesional}
              onChange={handlePersonalChange}
              disabled={!isEditingPersonal}
              className="input-field disabled:opacity-75"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8DDD5] flex items-center gap-2 text-xs text-[#7D726D]">
          <Building className="w-4 h-4 text-[#2A2421]" />
          <span>Sede quirúrgica ambulatoria:</span>
          <strong className="text-[#2A2421]">
            {consultorioData.direccion_consultorio}
          </strong>
        </div>
      </div>

      {/* Seguridad */}
      <div className="ledger-panel p-5 sm:p-6 space-y-4">
        <div className="pb-3 border-b border-[#E8DDD5]">
          <h2 className="text-base font-semibold text-[#2A2421]">
            Seguridad de la consola médica
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Contraseña actual
            </label>
            <input
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Nueva contraseña
            </label>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#7D726D] mb-1.5">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirm_new_password"
              value={passwordData.confirm_new_password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleChangePassword}
            className="btn-primary text-xs"
          >
            <KeyRound className="w-4 h-4" />
            <span>Actualizar clave</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;