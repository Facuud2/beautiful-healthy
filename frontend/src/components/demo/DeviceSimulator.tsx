import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Smartphone,
  Monitor,
  RotateCw,
  Wifi,
  Battery,
  Signal,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Bell,
  X,
  Sparkles,
  UserCheck,
  Stethoscope,
  RefreshCw,
  Volume2,
  Check,
  PanelLeft,
  Info,
} from 'lucide-react';
import { initMobileTouchDrag } from '../../utils/mobileTouchDrag';

interface DeviceSimulatorProps {
  children: React.ReactNode;
}

type DeviceType = 'iphone' | 'android';
type ViewMode = 'mobile' | 'desktop';
type Orientation = 'portrait' | 'landscape';
type UserRoleView = 'paciente' | 'profesional';

interface PushNotification {
  id: number;
  app: string;
  title: string;
  body: string;
  time: string;
  targetPath?: string;
}

const SAMPLE_NOTIFICATIONS: PushNotification[] = [
  {
    id: 1,
    app: 'Beautiful Health · Dra. Valeria Montes',
    title: 'Dra. Valeria Montes · Quintana 480',
    body: 'Hola Valentina, vi la foto de control que enviaste hoy. La desinflamación nasal va excelente; recordá aplicar las compresas y la bruma descongestiva cada 6 hs.',
    time: 'ahora',
    targetPath: '/portal-paciente',
  },
  {
    id: 2,
    app: 'Beautiful Health · Turnos & Sesiones',
    title: 'Recordatorio de Consulta Mañana',
    body: 'Tenés tu sesión de retiro de puntos con la Dra. Montes mañana a las 10:30 hs en Recoleta. Consultá las indicaciones en tu portal.',
    time: 'hace 3m',
    targetPath: '/portal-paciente',
  },
  {
    id: 3,
    app: 'Beautiful Health · Cuidados Postoperatorios',
    title: 'Pauta del Día D+5: Crioterapia & Hidratación',
    body: 'Se habilitó la nueva indicación médica: iniciar drenaje linfático suave y fotoprotección mineral SPF 50+.',
    time: 'ahora',
    targetPath: '/portal-paciente',
  },
  {
    id: 4,
    app: 'Beautiful Health · Mensajería Quirúrgica',
    title: 'Respuesta de la Dra. Valeria Montes',
    body: '“El edema leve en el párpado inferior en día 4 es completamente normal. Podés dormir con la cabecera a 45° como acordamos.”',
    time: 'ahora',
    targetPath: '/portal-paciente',
  },
];

const DEVICES: Record<
  DeviceType,
  { name: string; subtitle: string; width: number; height: number; radius: string; innerRadius: string }
> = {
  iphone: {
    name: 'iPhone 15 Pro Gold',
    subtitle: 'iOS · Dynamic Island',
    width: 393,
    height: 844,
    radius: 'rounded-[50px]',
    innerRadius: 'rounded-[38px]',
  },
  android: {
    name: 'Pixel Pearl Edition',
    subtitle: 'Android · Punch Hole',
    width: 412,
    height: 860,
    radius: 'rounded-[40px]',
    innerRadius: 'rounded-[30px]',
  },
};

const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ children }) => {
  const [isEmbedded] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return window.self !== window.top || params.get('embedded') === 'true';
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [viewMode, setViewMode] = useState<ViewMode>('mobile');
  const [device, setDevice] = useState<DeviceType>('iphone');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0.86);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showCompanion, setShowCompanion] = useState(true);
  const [timeStr, setTimeStr] = useState('09:41');
  const [activeNotification, setActiveNotification] = useState<PushNotification | null>(null);
  const [notificationIndex, setNotificationIndex] = useState(0);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isPatientPath = (path: string) => path.startsWith('/portal-paciente');

  const [activeRole, setActiveRole] = useState<UserRoleView>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/portal-paciente') ? 'paciente' : 'profesional';
    }
    return 'paciente';
  });

  useEffect(() => {
    setActiveRole(isPatientPath(location.pathname) ? 'paciente' : 'profesional');
  }, [location.pathname]);

  // Adjust default zoom according to window viewport
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const h = window.innerHeight;
      const w = window.innerWidth;
      if (orientation === 'landscape') {
        if (h < 650 || w < 1000) setScale(0.7);
        else if (h < 850) setScale(0.8);
        else setScale(0.86);
      } else {
        if (h < 780) setScale(0.76);
        else if (h < 900) setScale(0.84);
        else setScale(0.88);
      }
    }
  }, [orientation]);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    const nextNotif = SAMPLE_NOTIFICATIONS[notificationIndex % SAMPLE_NOTIFICATIONS.length];
    setNotificationIndex((prev) => prev + 1);
    setActiveNotification(nextNotif);

    // Audio cue (gentle high chime using Web Audio API)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // ignore audio context restrictions
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setActiveNotification(null);
    }, 7000);
  };

  const handleDismissNotification = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setActiveNotification(null);
  };

  const handleNotificationClick = () => {
    const target = activeNotification?.targetPath || '/portal-paciente';
    handleDismissNotification();
    if (viewMode === 'mobile') {
      if (iframeRef.current?.contentWindow) {
        const embeddedUrl = `${target}${target.includes('?') ? '&' : '?'}embedded=true`;
        iframeRef.current.contentWindow.location.href = embeddedUrl;
      }
      navigate(target, { replace: true });
    } else {
      navigate(target);
    }
  };

  const handleSwitchRole = (newRole: UserRoleView) => {
    setActiveRole(newRole);
    const targetPath = newRole === 'paciente' ? '/portal-paciente' : '/dashboard';

    if (viewMode === 'mobile') {
      if (iframeRef.current?.contentWindow) {
        const embeddedUrl = `${targetPath}${targetPath.includes('?') ? '&' : '?'}embedded=true`;
        iframeRef.current.contentWindow.location.href = embeddedUrl;
      }
      navigate(targetPath, { replace: true });
    } else {
      navigate(targetPath);
    }
  };

  if (isEmbedded) {
    return <>{children}</>;
  }

  const handleIframeLoad = () => {
    try {
      const iframePath = iframeRef.current?.contentWindow?.location.pathname;
      if (iframePath) {
        setActiveRole(isPatientPath(iframePath) ? 'paciente' : 'profesional');
        if (iframePath !== location.pathname) {
          navigate(iframePath, { replace: true });
        }
      }
      const iframeDoc = iframeRef.current?.contentDocument;
      const iframeWin = iframeRef.current?.contentWindow;
      if (iframeDoc && iframeWin) {
        initMobileTouchDrag(iframeDoc, iframeWin);
        const style = iframeDoc.createElement('style');
        style.textContent = `
          html, body {
            overflow-x: hidden !important;
            max-width: 100% !important;
            width: 100% !important;
            scroll-behavior: auto !important;
            -webkit-overflow-scrolling: touch;
            background-color: #FAF7F5 !important;
            color: #2A2421 !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            cursor: grab !important;
          }
          body:active {
            cursor: grabbing !important;
          }
          *, *::before, *::after {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            -webkit-user-drag: none !important;
          }
          input, textarea, [contenteditable="true"] {
            user-select: text !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            cursor: text !important;
          }
          button, a, [role="button"], [tabindex] {
            cursor: pointer !important;
          }
          * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
          ::selection { background: transparent !important; color: inherit !important; }
          ::-moz-selection { background: transparent !important; color: inherit !important; }
        `;
        iframeDoc.head.appendChild(style);
      }
    } catch {
      // ignore cross-origin errors
    }
  };

  const handleReload = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.location.reload();
    }
  };

  const handleToggleOrientation = () => {
    setIsRotating(true);
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
    setTimeout(() => {
      setIsRotating(false);
    }, 450);
  };

  const handleSwitchToDesktop = () => {
    try {
      const currentPath = iframeRef.current?.contentWindow?.location.pathname;
      if (currentPath && currentPath !== location.pathname) {
        navigate(currentPath, { replace: true });
      }
    } catch {
      // ignore
    }
    setViewMode('desktop');
  };

  const handleSwitchToMobile = () => {
    setViewMode('mobile');
  };

  const currentDevice = DEVICES[device];
  const isLandscape = orientation === 'landscape';
  const phoneWidth = isLandscape ? currentDevice.height : currentDevice.width;
  const phoneHeight = isLandscape ? currentDevice.width : currentDevice.height;

  const rotationAngle = isRotating ? (isLandscape ? '-35deg' : '35deg') : '0deg';
  const currentScale = isRotating ? scale * 0.86 : scale;

  const currentPath = location.pathname === '/' ? '/portal-paciente' : location.pathname;
  const iframeUrl =
    currentPath +
    location.search +
    (location.search ? '&' : '?') +
    'embedded=true' +
    location.hash;

  return (
    <div className="relative min-h-screen w-full font-sans select-none overflow-hidden bg-[#FAF7F5] text-[#2A2421]">
      <h1 className="sr-only">Beautiful Health · Dra. Valeria Montes · Consultorio Recoleta</h1>

      {/* FLOATING TOP INTERACTIVE CONTROLS */}
      <div
        data-ui="simulator-toolbar"
        className={`fixed top-3 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 max-w-[96vw] ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-70 hover:opacity-100 -translate-y-1'
        }`}
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[#FFFFFF] text-[#2A2421] px-3.5 py-2 rounded-[18px] border border-[#E8DDD5] text-sm font-semibold">
          {/* 1. MODO DE PANTALLA: MÓVIL vs COMPUTADORA */}
          <div className="flex bg-[#F4EBE6] p-0.5 rounded-[12px] border border-[#E8DDD5]">
            <button
              type="button"
              onClick={handleSwitchToMobile}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${
                viewMode === 'mobile'
                  ? 'bg-[#EAD49B] text-[#2A2421] border border-[#B38C3B] font-bold shadow-subtle'
                  : 'text-[#2A2421] hover:bg-[#FAF7F5] font-semibold'
              }`}
              title="Vista en smartphone con chasis interactivo"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Móvil</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToDesktop}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${
                viewMode === 'desktop'
                  ? 'bg-[#EAD49B] text-[#2A2421] border border-[#B38C3B] font-bold shadow-subtle'
                  : 'text-[#2A2421] hover:bg-[#FAF7F5] font-semibold'
              }`}
              title="Vista expandida en computadora / escritorio"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Computadora</span>
            </button>
          </div>

          <div className="h-4 w-px bg-[#E8DDD5] mx-0.5 hidden sm:block" />

          {/* 2. SELECTOR DE ROL: PORTAL PACIENTE (DNI) vs CONSOLA MÉDICA */}
          <div className="flex bg-[#F4EBE6] p-0.5 rounded-[12px] border border-[#E8DDD5]">
            <button
              type="button"
              onClick={() => handleSwitchRole('paciente')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${
                activeRole === 'paciente'
                  ? 'bg-[#F9E6E8] text-[#801B2B] border border-[#C97A85] font-bold shadow-subtle'
                  : 'text-[#2A2421] hover:bg-[#FAF7F5] font-semibold'
              }`}
              title="Portal de seguimiento para pacientes (ingreso con DNI)"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#801B2B]" />
              <span>Portal Paciente (DNI)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchRole('profesional')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all ${
                activeRole === 'profesional'
                  ? 'bg-[#EAD49B] text-[#2A2421] border border-[#B38C3B] font-bold shadow-subtle'
                  : 'text-[#2A2421] hover:bg-[#FAF7F5] font-semibold'
              }`}
              title="Consola médica quirúrgica de la Dra. Valeria Montes"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#2A2421]" />
              <span>Consola Médica</span>
            </button>
          </div>

          {/* 3. HERRAMIENTAS EXCLUSIVAS DEL MODO MÓVIL */}
          {viewMode === 'mobile' && controlsVisible && (
            <>
              <div className="h-4 w-px bg-[#E8DDD5] mx-0.5 hidden sm:block" />

              {/* Selector de Mockup: iOS (iPhone) vs Android (Pixel) */}
              <div className="flex bg-[#F4EBE6] p-0.5 rounded-[12px] border border-[#E8DDD5] text-xs">
                <button
                  type="button"
                  onClick={() => setDevice('iphone')}
                  className={`px-2.5 py-1 rounded-[8px] transition-all font-bold ${
                    device === 'iphone'
                      ? 'bg-[#FFFFFF] text-[#2A2421] border border-[#B38C3B] shadow-subtle'
                      : 'text-[#2A2421] hover:bg-[#FAF7F5]'
                  }`}
                  title="Mockup Apple iPhone 15 Pro Gold con Dynamic Island"
                >
                  iOS (iPhone)
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('android')}
                  className={`px-2.5 py-1 rounded-[8px] transition-all font-bold ${
                    device === 'android'
                      ? 'bg-[#FFFFFF] text-[#2A2421] border border-[#B38C3B] shadow-subtle'
                      : 'text-[#2A2421] hover:bg-[#FAF7F5]'
                  }`}
                  title="Mockup Android Pixel Pearl Edition con Punch-hole"
                >
                  Android
                </button>
              </div>

              {/* Botón de Simulación de Notificación Push */}
              <button
                type="button"
                onClick={handleTriggerNotification}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[#E8F3EE] hover:bg-[#D5EBDD] border border-[#3B7A57] text-[#143D28] font-bold transition"
                title="Lanzar un aviso push médico realista sobre la pantalla del teléfono"
              >
                <Bell className="w-3.5 h-3.5 text-[#143D28]" />
                <span className="text-xs">Aviso Push</span>
              </button>

              {/* Giro Vertical / Horizontal */}
              <button
                type="button"
                onClick={handleToggleOrientation}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] transition-all duration-300 border ${
                  isLandscape
                    ? 'bg-[#F9E6E8] border-[#C97A85] text-[#801B2B] font-bold'
                    : 'bg-[#F4EBE6] border-[#E8DDD5] text-[#2A2421] hover:border-[#C5A059] font-semibold'
                }`}
                title={isLandscape ? 'Volver a modo vertical' : 'Girar a modo horizontal'}
              >
                <RotateCw
                  className={`w-3.5 h-3.5 text-[#2A2421] transition-transform duration-500 ${
                    isLandscape ? 'rotate-90' : ''
                  }`}
                />
                <span className="text-xs hidden md:inline">{isLandscape ? 'Vertical' : 'Girar'}</span>
              </button>

              {/* Botón para Mostrar/Ocultar Ficha saliendo detrás del móvil */}
              <button
                type="button"
                onClick={() => setShowCompanion(!showCompanion)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] transition-all border ${
                  showCompanion
                    ? 'bg-[#F9E6E8] border-[#C97A85] text-[#801B2B] font-bold shadow-subtle'
                    : 'bg-[#F4EBE6] border-[#E8DDD5] text-[#2A2421] hover:border-[#C5A059] font-semibold'
                }`}
                title={
                  showCompanion
                    ? 'Ocultar ficha informativa detrás del móvil'
                    : 'Hacer salir la ficha informativa desde detrás del móvil'
                }
              >
                <PanelLeft className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-xs hidden md:inline">
                  {showCompanion ? 'Ocultar Ficha' : 'Ficha Clínica'}
                </span>
              </button>

              {/* Controles de Zoom */}
              <div className="hidden lg:flex items-center gap-0.5 text-[#2A2421]">
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.max(0.55, Number((s - 0.05).toFixed(2))))}
                  className="p-1.5 hover:text-[#2A2421] hover:bg-[#F4EBE6] rounded-lg transition"
                  title="Reducir escala"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-[#2A2421] w-9 text-center font-bold">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setScale((s) => Math.min(1.2, Number((s + 0.05).toFixed(2))))}
                  className="p-1.5 hover:text-[#2A2421] hover:bg-[#F4EBE6] rounded-lg transition"
                  title="Aumentar escala"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botón de Recargar */}
              <button
                type="button"
                onClick={handleReload}
                className="p-1.5 text-[#2A2421] hover:text-[#B38C3B] hover:bg-[#F4EBE6] rounded-lg transition"
                title="Recargar vista móvil"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Minimizar / Expandir barra */}
          <button
            type="button"
            onClick={() => setControlsVisible(!controlsVisible)}
            className="p-1.5 text-[#2A2421] hover:bg-[#F4EBE6] rounded-lg transition ml-0.5"
            title={controlsVisible ? 'Minimizar barra de controles' : 'Expandir barra de controles'}
          >
            {controlsVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ÁREA DE RENDERIZADO */}
      {viewMode === 'desktop' ? (
        /* MODO COMPUTADORA / ESCRITORIO EXPANDIDO */
        <div className="w-full min-h-screen bg-[#FAF7F5] pt-16 flex flex-col overflow-y-auto">
          {children}
        </div>
      ) : (
        /* MODO MOCKUP MÓVIL ESTUDIO (iOS / Android) CON TARJETA DE ESTUDIO LATERAL QUE EMERGE DETRÁS DEL MÓVIL */
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#FAF7F5] relative overflow-hidden pt-16 sm:pt-20 select-none">
          {/* CONTENEDOR RELATIVO PARA EL MOCKUP Y LA TARJETA */}
          <div className="relative flex items-center justify-center">
            {/* Tarjeta de Acompañamiento: Emerge y se oculta detrás del móvil */}
            <aside
              data-ui="studio-companion"
              style={{
                transition:
                  'transform 0.5s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.38s ease, filter 0.38s ease',
              }}
              className={`hidden xl:flex flex-col justify-between w-80 p-6 rounded-[20px] bg-[#FFFFFF] border border-[#E8DDD5] shadow-subtle space-y-4 shrink-0 absolute right-[calc(100%+24px)] z-0 select-none ${
                showCompanion
                  ? 'translate-x-0 opacity-100 pointer-events-auto filter-none'
                  : 'translate-x-[calc(100%+24px)] scale-95 opacity-0 pointer-events-none blur-[1px]'
              }`}
            >
              {/* Botón de repliegue superior derecho dentro de la tarjeta */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E8DDD5]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs font-bold text-[#8C6B23]">
                    Ficha de la Clínica
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompanion(false)}
                  className="p-1 rounded-[8px] text-[#7D726D] hover:text-[#2A2421] hover:bg-[#F4EBE6] transition-colors"
                  title="Ocultar ficha detrás del móvil"
                  aria-label="Cerrar ficha"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4EBE6] text-[#C5A059] flex items-center justify-center font-bold shadow-subtle shrink-0">
                    <Sparkles className="w-5 h-5 text-[#8C6B23]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#8C6B23] block">
                      Distrito Médico Recoleta
                    </span>
                    <span className="font-semibold text-sm text-[#2A2421] block">
                      Quintana 480 · Piso 4
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#2A2421]">
                    Dra. Valeria Montes
                  </h2>
                  <p className="text-sm text-[#7D726D] mt-0.5">
                    M.N. 114.892 · Cirugía Plástica & Armonización Facial
                  </p>
                  <p className="text-sm text-[#2A2421] mt-2 leading-relaxed">
                    Plataforma integrada de seguimiento para pacientes en recuperación quirúrgica y consultas de medicina estética.
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8DDD5] space-y-2 text-sm">
                  <p className="font-semibold text-[#2A2421]">Herramientas del simulador:</p>
                  <ul className="space-y-2 text-[#5C4E46]">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#3B7A57] shrink-0 mt-0.5" />
                      <span><strong>Portal Paciente:</strong> acceso con DNI para ver indicaciones y citas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#3B7A57] shrink-0 mt-0.5" />
                      <span><strong>Consola Médica:</strong> historial clínico y padrón quirúrgico.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#3B7A57] shrink-0 mt-0.5" />
                      <span><strong>Aviso Push:</strong> simulación de mensajes de la cirujana.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DDD5] text-sm text-[#7D726D] flex items-center justify-between">
                <span>Buenos Aires · Argentina</span>
                <span className="num font-semibold text-[#8C6B23]">Beautiful Health v2.4</span>
              </div>
            </aside>

            {/* Pestaña lateral que asoma detrás del móvil cuando la ficha está oculta */}
            {!showCompanion && (
              <button
                type="button"
                onClick={() => setShowCompanion(true)}
                className="hidden xl:flex absolute -left-8 top-28 z-0 items-center justify-center w-8 h-14 bg-[#FFFFFF] border-y border-l border-[#C5A059]/50 rounded-l-2xl shadow-subtle text-[#8C6B23] hover:text-[#2A2421] hover:-translate-x-1 transition-all duration-200 group"
                title="Hacer salir la ficha informativa desde detrás del móvil"
                aria-label="Abrir ficha informativa"
              >
                <PanelLeft className="w-4 h-4 text-[#C5A059] group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* Chasis físico del Smartphone en z-20 */}
            <div
              data-ui="device-chassis"
              style={{
                width: phoneWidth,
                height: phoneHeight,
                transform: `scale(${currentScale}) rotate(${rotationAngle})`,
                transformOrigin: 'center center',
                transition:
                  'width 0.5s cubic-bezier(0.34, 1.4, 0.64, 1), height 0.5s cubic-bezier(0.34, 1.4, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.4, 0.64, 1)',
                boxShadow: '0 4px 16px -2px rgba(42, 36, 33, 0.08)',
              }}
              className={`relative z-20 ${currentDevice.radius} bg-[#EFE6DF] p-[10px] border-[3px] border-[#C5A059] flex flex-col shrink-0 select-none`}
          >
            {/* Botones de hardware laterales en oro champagne */}
            {!isLandscape ? (
              <>
                <div className="absolute -left-[5px] top-[110px] w-[3px] h-[36px] bg-[#C5A059] rounded-l" />
                <div className="absolute -left-[5px] top-[160px] w-[3px] h-[36px] bg-[#C5A059] rounded-l" />
                <div className="absolute -right-[5px] top-[130px] w-[3px] h-[50px] bg-[#C5A059] rounded-r" />
              </>
            ) : (
              <>
                <div className="absolute top-[-5px] right-[140px] w-[50px] h-[3px] bg-[#C5A059] rounded-t" />
                <div className="absolute top-[-5px] left-[110px] w-[36px] h-[3px] bg-[#C5A059] rounded-t" />
                <div className="absolute top-[-5px] left-[160px] w-[36px] h-[3px] bg-[#C5A059] rounded-t" />
              </>
            )}

            {/* Marco de Pantalla Interior */}
            <div
              className={`relative w-full h-full overflow-hidden bg-[#FAF7F5] border border-[#E8DDD5] ${currentDevice.innerRadius} flex flex-col`}
            >
              {/* BANNER INTERACTIVO DE NOTIFICACIÓN PUSH */}
              {activeNotification && (
                <div className="absolute top-10 inset-x-3 z-50 transition-all duration-300 animate-fade-in">
                  <div
                    data-ui="push-banner"
                    onClick={handleNotificationClick}
                    className="cursor-pointer bg-[#FFFFFF] p-3.5 rounded-[18px] shadow-subtle border border-[#C5A059]/50 transition-transform hover:scale-[0.99] active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-[6px] flex items-center justify-center text-white bg-[#C5A059] shadow-subtle"
                        >
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-bold text-[#8C6B23]">
                          {activeNotification.app}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#5C4E46] font-medium">{activeNotification.time}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismissNotification();
                          }}
                          className="text-[#5C4E46] hover:text-[#2A2421] p-0.5 rounded-full"
                          aria-label="Cerrar notificación"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-[#2A2421] tracking-tight">
                      {activeNotification.title}
                    </p>
                    <p className="text-[11px] text-[#5C4E46] line-clamp-2 mt-0.5 leading-snug">
                      {activeNotification.body}
                    </p>
                  </div>
                </div>
              )}

              {/* BARRA DE ESTADO SUPERIOR MÓVIL (iOS / Android) */}
              <div className="w-full h-8 px-6 flex items-center justify-between text-[#2A2421] text-[11px] font-semibold tracking-tight bg-[#FFFFFF] border-b border-[#E8DDD5] shrink-0 select-none">
                <span className="w-12 text-left">{timeStr}</span>

                {/* Recorte de cámara: Dynamic Island (iOS) vs Punch-hole (Android) */}
                {device === 'iphone' ? (
                  <div className="w-[84px] h-[18px] bg-[#2A2421] rounded-full flex items-center justify-end pr-2 gap-1.5">
                    <div className="w-2 h-2 bg-[#C5A059]/60 rounded-full" />
                  </div>
                ) : (
                  <div className="w-2.5 h-2.5 bg-[#2A2421] rounded-full" />
                )}

                <div className="w-12 flex items-center justify-end gap-1.5 text-[#2A2421]">
                  <Signal className="w-3 h-3 stroke-[2.5]" />
                  <Wifi className="w-3 h-3 stroke-[2.5]" />
                  <Battery className="w-3.5 h-3.5 stroke-[2.5] text-[#C5A059]" />
                </div>
              </div>

              {/* Iframe con la aplicación en vivo y scroll táctil cinético */}
              <iframe
                ref={iframeRef}
                src={iframeUrl}
                onLoad={handleIframeLoad}
                title="Beautiful Health Vista Interactiva"
                className="w-full flex-1 border-none bg-[#FAF7F5] overflow-hidden"
              />

              {/* BARRA DE NAVEGACIÓN INFERIOR (Home indicator) */}
              <div className="w-full h-4 bg-[#FFFFFF] flex items-center justify-center shrink-0 border-t border-[#E8DDD5]">
                <div
                  className={`${
                    isLandscape ? 'w-44' : 'w-24'
                  } h-1 bg-[#E8DDD5] rounded-full`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default DeviceSimulator;
