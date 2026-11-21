import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MessageSquare,
  FileText,
  LogOut,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Resumen clínico", path: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda de sesiones", path: "/consultas", badge: "9", icon: CalendarCheck },
  { label: "Mensajería post-op", path: "/mensajeria", badge: "5", icon: MessageSquare },
  { label: "Padrón de pacientes", path: "/patients", icon: Users },
  { label: "Historias clínicas", path: "/historia-clinica", icon: FileText },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar = ({ mobileOpen = false, onCloseMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleNavClick = (path: string) => {
    navigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isProfileActive = location.pathname === "/profile";
  const rawName = user?.username || "Dra. Valeria Montes";
  const doctorDisplayName = rawName.startsWith("Dra.") ? rawName : `Dra. ${rawName}`;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#0a0a0a]/35 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Navegación clínica principal"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FAF7F5] border-r border-[#E8DDD5] flex flex-col justify-between transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 lg:w-60 lg:z-auto shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Identidad institucional del consultorio */}
          <div className="px-4 h-14 flex items-center justify-between border-b border-[#E8DDD5] bg-[#FFFFFF]">
            <button
              type="button"
              onClick={() => handleNavClick("/dashboard")}
              className="flex items-center gap-2.5 text-left min-w-0"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 bg-[#C5A059] shadow-subtle"
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-semibold tracking-tight text-[#2A2421] truncate">
                  Medi<span className="text-[#C5A059]">App</span> · Dra. Montes
                </span>
                <span className="block text-[11px] text-[#7D726D] truncate">
                  Quintana 480 · Recoleta
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-[8px] text-[#7D726D] hover:text-[#2A2421] hover:bg-[#F4EBE6] transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de navegación */}
          <div className="px-3 py-4">
            <p className="px-2.5 mb-2 text-xs font-semibold text-[#8C6B23]">
              Estación quirúrgica
            </p>
            <nav className="space-y-1" aria-label="Secciones de gestión">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-[#FFFFFF] text-[#2A2421] font-semibold border border-[#E8DDD5] shadow-subtle"
                        : "text-[#7D726D] hover:bg-[#F4EBE6] hover:text-[#2A2421] font-medium"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-[#C5A059]" : "text-[#7D726D]"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`num text-xs px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? "bg-[#F9E6E8] text-[#C97A85] border border-[#C97A85]/30"
                            : "bg-[#F4EBE6] text-[#7D726D]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-[#E8DDD5]">
              <p className="px-2.5 mb-2 text-xs font-semibold text-[#7D726D]">
                Vistas vinculadas
              </p>
              <button
                type="button"
                onClick={() => handleNavClick("/portal-paciente")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-sm text-[#7D726D] hover:bg-[#F4EBE6] hover:text-[#2A2421] transition-colors"
              >
                <span className="truncate">Portal de paciente (DNI)</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[#C5A059]" />
              </button>
            </div>
          </div>
        </div>

        {/* Pie de barra lateral: ficha profesional y cierre de sesión */}
        <div className="p-3 border-t border-[#E8DDD5] space-y-2 bg-[#FFFFFF]">
          <button
            type="button"
            onClick={() => handleNavClick("/profile")}
            className={`w-full p-2.5 rounded-[12px] border text-left transition-all ${
              isProfileActive
                ? "bg-[#F4EBE6] border-[#C5A059] shadow-subtle"
                : "bg-[#FAF7F5] border-[#EFE6DF] hover:border-[#C5A059]"
            }`}
          >
            <p className="text-sm font-semibold text-[#2A2421] truncate">
              {doctorDisplayName}
            </p>
            <p className="num text-xs text-[#7D726D] truncate mt-0.5">
              M.N. 114.892 · Cirugía Plástica
            </p>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-[#7D726D] hover:text-[#2A2421] hover:bg-[#F4EBE6] rounded-[10px] transition-colors"
          >
            <span>Cerrar turno de consola</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
