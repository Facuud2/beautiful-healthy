import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Menu, X, Bell, Check, Calendar, MessageSquare, UserCheck, Sparkles } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard": "Resumen clínico",
  "/mensajeria": "Mensajería postoperatoria",
  "/patients": "Padrón de pacientes",
  "/patients/new": "Alta de paciente",
  "/historia": "Evolución clínica",
  "/historia-clinica": "Historias clínicas",
  "/tratamientos": "Protocolos e indicaciones",
  "/consultas": "Agenda de sesiones",
  "/profile": "Ficha profesional",
};

interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "message" | "appointment" | "patient";
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "n1",
    title: "Valentina Quiroga · D+4 Rinoplastia",
    description: "Envió foto de control de férula nasal y consultó por edema palpebral.",
    time: "09:42",
    read: false,
    type: "message",
  },
  {
    id: "n2",
    title: "Martín Echeverría · D+6 Blefaroplastia",
    description: "Sesión de retiro de sutura intradérmica hoy a las 12:00 hs.",
    time: "09:15",
    read: false,
    type: "appointment",
  },
  {
    id: "n3",
    title: "Elena Rivas de Alvear · D+2 Lifting",
    description: "Confirmó drenaje linfático facial asistido para mañana 11:00 hs.",
    time: "Ayer",
    read: true,
    type: "patient",
  },
];

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header = ({ onToggleMobileMenu, isMobileMenuOpen = false }: HeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentSection = routeLabels[location.pathname] || "Registro clínico";
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotifIcon = (type: SystemNotification["type"]) => {
    if (type === "appointment") return <Calendar className="w-3.5 h-3.5 text-[#0a0a0a]" />;
    if (type === "patient") return <UserCheck className="w-3.5 h-3.5 text-[#1b6e3c]" />;
    return <MessageSquare className="w-3.5 h-3.5 text-[#1d5fbf]" />;
  };

  const rawName = user?.username || "Dra. Valeria Montes";
  const doctorDisplayName = rawName.startsWith("Dra.") ? rawName : `Dra. ${rawName}`;

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E8DDD5] h-14 shrink-0 shadow-subtle">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
        {/* Izquierda: Menú móvil + ruta contextual */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 -ml-1 rounded-[8px] text-[#2A2421] hover:bg-[#F4EBE6] transition-colors shrink-0"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-[#2A2421]" />
            ) : (
              <Menu className="w-4 h-4 text-[#2A2421]" />
            )}
          </button>

          <nav aria-label="Ubicación actual" className="flex items-center gap-2 text-sm text-[#7D726D] truncate">
            <span className="hidden sm:inline font-medium text-[#7D726D]">
              Av. Quintana 480, Piso 4 · Recoleta
            </span>
            <span className="hidden sm:inline text-[#E8DDD5]">/</span>
            <span className="font-semibold text-[#2A2421] truncate">{currentSection}</span>
          </nav>
        </div>

        {/* Derecha: Estado de guardia, notificaciones y acceso rápido */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/portal-paciente")}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold bg-[#F9E6E8] text-[#C97A85] border border-[#C97A85]/30 hover:brightness-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C97A85]" />
            <span>Portal Paciente</span>
          </button>

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-medium bg-[#FFFFFF] text-[#2A2421] hover:border-[#C5A059] border border-[#E8DDD5] shadow-subtle transition-colors"
              aria-label="Avisos clínicos"
            >
              <Bell className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="hidden sm:inline">Avisos</span>
              {unreadCount > 0 && (
                <span className="num px-1.5 py-0.2 rounded-full text-xs bg-[#C5A059] text-[#FFFFFF] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                data-ui="dropdown"
                className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-1.5 w-[calc(100vw-1.5rem)] max-w-xs sm:w-80 rounded-[16px] bg-[#FFFFFF] border border-[#E8DDD5] shadow-dropdown z-50 overflow-hidden"
              >
                <div className="px-3.5 py-2.5 border-b border-[#E8DDD5] bg-[#FAF7F5] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2A2421]">
                    Avisos postoperatorios
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-[#595959] hover:text-[#0a0a0a] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Marcar leídos</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#e6e6e6]">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleNotificationRead(item.id)}
                      className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 ${
                        item.read ? "bg-[#ffffff]" : "bg-[#f4f3f1]/60 hover:bg-[#f4f3f1]"
                      }`}
                    >
                      <div className="p-1.5 rounded-[4px] bg-[#ffffff] border border-[#e6e6e6] shrink-0 mt-0.5">
                        {getNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-[#0a0a0a] truncate">
                            {item.title}
                          </p>
                          <span className="num text-xs text-[#595959] shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-[#595959] mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="num hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium bg-[#e8f5ee] text-[#1b6e3c] border border-[#c3e6d1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1b6e3c]" />
            Quirófano activo
          </span>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-[#e6e6e6] text-xs">
            <span className="font-medium text-[#0a0a0a]">{doctorDisplayName}</span>
            <span className="num text-[#595959]">M.N. 114.892</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
