import React from "react";
import { usePatientPortal } from "../context/PatientContext";
import {
  Home,
  FileText,
  MessageSquare,
  User,
  LogOut,
  Bell,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PatientHeader: React.FC = () => {
  const {
    currentPatient,
    activeTab,
    setActiveTab,
    logout,
    unreadNotesCount,
    proximasSesionesAgendadas,
  } = usePatientPortal();

  const navigate = useNavigate();

  if (!currentPatient) return null;

  const handleLogout = () => {
    logout();
    navigate("/portal-paciente/login");
  };

  const navItems = [
    { id: "inicio", label: "Resumen", icon: Home },
    {
      id: "notas",
      label: "Canal con Dra. Montes",
      icon: MessageSquare,
      unreadBadge: unreadNotesCount > 0 ? unreadNotesCount : undefined,
    },
    {
      id: "documentos",
      label: "Indicaciones post-op",
      icon: FileText,
      badge: proximasSesionesAgendadas.length,
    },
    { id: "perfil", label: "Ficha personal", icon: User },
  ] as const;

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E8DDD5] sticky top-0 z-40 w-full shrink-0 shadow-subtle">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-[#F4EBE6] text-[#7D726D] border border-[#E8DDD5] hover:border-[#C5A059] hover:text-[#2A2421] transition-all shrink-0"
              title="Volver al consultorio médico"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Consola médica</span>
            </button>

            <span className="font-semibold text-sm sm:text-base text-[#2A2421] tracking-tight truncate">
              Medi<span className="text-[#C5A059]">App</span> · Portal de Paciente
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("notas")}
              className="relative p-2 rounded-[10px] text-[#7D726D] hover:text-[#2A2421] hover:bg-[#F4EBE6] transition-colors"
              title="Mensajes de la Dra. Montes"
            >
              <Bell className="w-4 h-4 text-[#C5A059]" />
              {unreadNotesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C97A85]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("perfil")}
              className="flex items-center gap-2 pl-2 border-l border-[#E8DDD5]"
              title={`Ver perfil de ${currentPatient.nombre} ${currentPatient.apellido}`}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-semibold text-xs text-white shrink-0 bg-[#C5A059] shadow-subtle"
              >
                {currentPatient.nombre[0]}
                {currentPatient.apellido[0]}
              </div>
              <span className="hidden md:block text-xs font-semibold text-[#2A2421]">
                {currentPatient.nombre} {currentPatient.apellido}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-[10px] text-[#7D726D] hover:text-[#C97A85] hover:bg-[#F9E6E8] transition-colors shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto border-t border-[#E8DDD5]">
          <nav className="flex space-x-1.5 py-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-[#C5A059] text-white border-transparent shadow-subtle"
                      : "bg-[#FFFFFF] text-[#7D726D] border-[#E8DDD5] hover:text-[#2A2421] hover:bg-[#F4EBE6]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>

                  {"badge" in item && item.badge !== undefined && (
                    <span
                      className={`num text-xs px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-[#FFFFFF]/25 text-white"
                          : "bg-[#F4EBE6] text-[#7D726D]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {"unreadBadge" in item && item.unreadBadge !== undefined && (
                    <span className="num text-xs px-1.5 py-0.2 rounded-full font-bold bg-[#F9E6E8] text-[#C97A85] border border-[#C97A85]/30">
                      {item.unreadBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
