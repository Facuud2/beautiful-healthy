import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import {
  MessageSquareHeart,
  Search,
  Send,
  Trash2,
  User,
  CheckCheck,
  Sparkles,
  Phone,
  ArrowLeft,
  History,
  X,
  Calendar,
} from 'lucide-react';

interface PreviousSessionItem {
  sesion: string;
  fecha: string;
  motivo: string;
  resumenClinico: string;
  observacionCirujana: string;
}

interface Patient {
  id: number | string;
  nombre: string;
  apellido: string;
  dni: string;
  edad: number;
  genero: string;
  telefono?: string;
  email?: string;
  procedimiento: string;
  progresoSesion: string;
  proximaCita: string;
  sesionesPrevias: PreviousSessionItem[];
}

interface Message {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const patientProfilesPool: Array<{
  procedimiento: string;
  progresoSesion: string;
  proximaCita: string;
  edad: number;
  genero: string;
  sesionesPrevias: PreviousSessionItem[];
}> = [
  {
    procedimiento: 'Rinoplastia Ultrasónica & Perfiloplastia',
    progresoSesion: 'Sesión 3 de 4',
    proximaCita: 'Viernes 16:00 hs (Retiro de férula)',
    edad: 31,
    genero: 'Femenino',
    sesionesPrevias: [
      {
        sesion: 'Sesión 1 • Evaluación Inicial',
        fecha: '10 Oct',
        motivo: 'Valoración y planificación',
        resumenClinico: 'Evaluación de estructura nasal y preparación cutánea.',
        observacionCirujana: 'Se entregan pautas de preparación previa y ayuno de 8 hs.',
      },
      {
        sesion: 'Sesión 2 • Control 48 hs',
        fecha: '14 Oct',
        motivo: 'Primer control en consultorio',
        resumenClinico: 'Inflamación leve esperable en tercio medio, punta centrada y sutura limpia.',
        observacionCirujana: 'Excelente respuesta inicial sin hematomas periorbitarios.',
      },
      {
        sesion: 'Sesión 3 • Control evolutivo',
        fecha: 'Hoy',
        motivo: 'Seguimiento de desinflamación',
        resumenClinico: 'Reducción marcada del edema, dorso armónico y sin signos inflamatorios.',
        observacionCirujana: 'Evolución muy favorable. Lista para retiro de férula el viernes.',
      },
    ],
  },
  {
    procedimiento: 'Blefaroplastia Superior & Láser Periorbitario',
    progresoSesion: 'Sesión 3 de 4',
    proximaCita: 'Martes 11:30 hs (Control en consultorio)',
    edad: 46,
    genero: 'Masculino',
    sesionesPrevias: [
      {
        sesion: 'Sesión 1 • Intervención Ambulatoria',
        fecha: '05 Oct',
        motivo: 'Procedimiento en consultorio',
        resumenClinico: 'Edema palpebral leve inicial, pliegue simétrico bilateral.',
        observacionCirujana: 'Procedimiento de 50 min sin complicaciones. Se indica frío local.',
      },
      {
        sesion: 'Sesión 2 • Retiro de Sutura',
        fecha: '11 Oct',
        motivo: 'Control y retiro de puntos',
        resumenClinico: 'Apertura ocular descansada y línea cicatrizal limpia.',
        observacionCirujana: 'Se indica crema reparadora y protección solar.',
      },
      {
        sesion: 'Sesión 3 • Control Día 12',
        fecha: 'Hoy',
        motivo: 'Evaluación de cicatrización',
        resumenClinico: 'Desinflamación completa y simetría consolidada.',
        observacionCirujana: 'Alta para retomar actividad física suave con protector solar FPS 50+.',
      },
    ],
  },
  {
    procedimiento: 'Lifting Facial Deep Plane & Lipofilling Malar',
    progresoSesion: 'Sesión 2 de 4',
    proximaCita: 'Lunes 08:30 hs (Turno programado)',
    edad: 54,
    genero: 'Femenino',
    sesionesPrevias: [
      {
        sesion: 'Sesión 1 • Diagnóstico Inicial',
        fecha: '02 Oct',
        motivo: 'Primera consulta y valoración',
        resumenClinico: 'Evaluación de tercio inferior y biotipo cutáneo.',
        observacionCirujana: 'Se define plan quirúrgico y estudios prequirúrgicos.',
      },
      {
        sesion: 'Sesión 2 • Control de Estudios',
        fecha: '12 Oct',
        motivo: 'Revisión de laboratorio y preparación',
        resumenClinico: 'Estudios dentro de parámetros normales, piel hidratada.',
        observacionCirujana: 'Se indican pautas previas para el turno del lunes.',
      },
    ],
  },
  {
    procedimiento: 'Armonización Facial & Bioestimulación',
    progresoSesion: 'Sesión 2 de 3',
    proximaCita: 'Jueves 17:30 hs (Control final)',
    edad: 27,
    genero: 'Masculino',
    sesionesPrevias: [
      {
        sesion: 'Sesión 1 • Estructuración Mandibular',
        fecha: '09 Oct',
        motivo: 'Aplicación de ácido hialurónico',
        resumenClinico: 'Leve inflamación local esperada, puntos de cánula cerrados.',
        observacionCirujana: 'Se aplicaron viales con cánula atraumática.',
      },
      {
        sesion: 'Sesión 2 • Control de Integración',
        fecha: 'Hoy',
        motivo: 'Revisión a los 8 días',
        resumenClinico: 'Tejido desinflamado y producto bien integrado.',
        observacionCirujana: 'Evolución óptima. Próxima sesión solo requiere control final.',
      },
    ],
  },
  {
    procedimiento: 'Mastoplastia de Aumento Dual Plane',
    progresoSesion: 'Sesión 2 de 5',
    proximaCita: 'Miércoles 15:00 hs (Control y ultrasonido)',
    edad: 34,
    genero: 'Femenino',
    sesionesPrevias: [
      {
        sesion: 'Sesión 1 • Control 24 hs',
        fecha: '12 Oct',
        motivo: 'Revisión inicial',
        resumenClinico: 'Tensión moderada esperable, vendaje compresivo en posición.',
        observacionCirujana: 'Buena respuesta analgésica. Reposo relativo indicado.',
      },
      {
        sesion: 'Sesión 2 • Control Día 6',
        fecha: 'Hoy',
        motivo: 'Control de evolución y herida',
        resumenClinico: 'Menor tensión muscular, herida limpia y seca.',
        observacionCirujana: 'Inicia ejercicios suaves de respiración y drenaje linfático.',
      },
    ],
  },
];

const defaultMockPatients: Patient[] = [
  {
    id: 1,
    nombre: 'Valentina',
    apellido: 'Montes',
    dni: '38.492.104',
    edad: 31,
    genero: 'Femenino',
    telefono: '+54 11 4567-8901',
    email: 'valentina.montes@mail.com',
    ...patientProfilesPool[0],
  },
  {
    id: 2,
    nombre: 'Martín',
    apellido: 'Echeverría',
    dni: '29.841.552',
    edad: 42,
    genero: 'Masculino',
    telefono: '+54 11 5876-5432',
    email: 'martin.echeverria@email.com',
    ...patientProfilesPool[1],
  },
  {
    id: 3,
    nombre: 'Elena',
    apellido: 'Rivas de Alvear',
    dni: '21.049.883',
    edad: 57,
    genero: 'Femenino',
    telefono: '+54 11 6234-5678',
    email: 'elena.rivas@email.com',
    ...patientProfilesPool[2],
  },
  {
    id: 4,
    nombre: 'Lucas',
    apellido: 'Benítez',
    dni: '41.220.918',
    edad: 29,
    genero: 'Masculino',
    telefono: '+54 11 3344-9988',
    email: 'lucas.benitez@email.com',
    ...patientProfilesPool[3],
  },
  {
    id: 5,
    nombre: 'Sofía',
    apellido: 'Gutiérrez',
    dni: '35.910.441',
    edad: 34,
    genero: 'Femenino',
    telefono: '+54 11 2345-6789',
    email: 'sofia.gutierrez@email.com',
    ...patientProfilesPool[4],
  },
];

const initialConversations: Record<string, Message[]> = {
  '1': [
    {
      id: 'm1',
      sender: 'doctor',
      text: 'Hola Valentina, ¿cómo amaneciste hoy? Recordá mantener la cabecera elevada y limpiar suavemente con solución fisiológica tibia.',
      timestamp: '09:15',
      status: 'read',
    },
    {
      id: 'm2',
      sender: 'patient',
      text: 'Buen día Dra. Valeria! Amanecí mucho más desinflamada que el martes. Casi no siento congestión y no tuve hematomas.',
      timestamp: '09:22',
      status: 'read',
    },
    {
      id: 'm3',
      sender: 'doctor',
      text: 'Excelente noticia Valentina. La desinflamación va muy bien. Nos vemos el viernes a las 16:00 hs para retirar la férula.',
      timestamp: '09:28',
      status: 'read',
    },
  ],
  '2': [
    {
      id: 'm4',
      sender: 'patient',
      text: 'Hola Doctora, le escribo por el control de la Blefaroplastia. Ya no tengo nada de inflamación a la mañana, ¿puedo retomar gimnasio suave?',
      timestamp: '10:05',
      status: 'read',
    },
    {
      id: 'm5',
      sender: 'doctor',
      text: 'Hola Martín, la cicatrización viene muy bien. Podés retomar caminata y actividad suave sin impacto usando gafas con filtro UV.',
      timestamp: '10:14',
      status: 'read',
    },
  ],
  '3': [
    {
      id: 'm6',
      sender: 'doctor',
      text: 'Hola Elena, te envío estas indicaciones: para el lunes recordá iniciar ayuno total 8 hs antes, asistir con rostro limpio sin cremas ni maquillaje y traer una prenda abotonada al frente.',
      timestamp: 'Ayer 18:30',
      status: 'read',
    },
    {
      id: 'm7',
      sender: 'patient',
      text: 'Perfecto Dra., ya tengo todo preparado y suspendí los suplementos como me indicó en la consulta.',
      timestamp: 'Ayer 19:02',
      status: 'read',
    },
  ],
};

const Mensajeria: React.FC = () => {
  const location = useLocation();
  const [patients, setPatients] = useState<Patient[]>(defaultMockPatients);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | number>(defaultMockPatients[0].id);
  const [conversations, setConversations] = useState<Record<string, Message[]>>(initialConversations);
  const [inputText, setInputText] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showHistoryPanel, setShowHistoryPanel] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (location.state?.patientId) {
      setSelectedPatientId(location.state.patientId);
      setMobileView('chat');
    }
  }, [location.state]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 84)}px`;
    }
  }, [inputText]);

  useEffect(() => {
    apiClient
      .get('/api/v1/pacientes')
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.pacientes)
          ? data.pacientes
          : data.patients || [];

        if (list.length > 0) {
          const mapped: Patient[] = list.map((p: any, index: number) => {
            const preset = patientProfilesPool[index % patientProfilesPool.length];
            return {
              id: p.id || p.dni || index + 10,
              nombre: p.nombre || p.firstName || 'Paciente',
              apellido: p.apellido || p.lastName || '',
              dni: p.dni || p.nro_credencial || '',
              edad: preset.edad,
              genero: p.genero || p.gender || preset.genero,
              telefono: p.telefono || '+54 11 4890-1200',
              email: p.email || '',
              procedimiento: p.plan || p.procedimiento || preset.procedimiento,
              progresoSesion: preset.progresoSesion,
              proximaCita: preset.proximaCita,
              sesionesPrevias: preset.sesionesPrevias,
            };
          });
          const combined = [...defaultMockPatients];
          mapped.forEach((mp) => {
            if (!combined.some((c) => String(c.dni) === String(mp.dni))) {
              combined.push(mp);
            }
          });
          setPatients(combined);
        }
      })
      .catch(() => {
        setPatients(defaultMockPatients);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPatientId, conversations, mobileView]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const full = `${p.nombre} ${p.apellido} ${p.procedimiento}`.toLowerCase();
      return full.includes(q) || p.dni.toString().includes(q);
    });
  }, [patients, searchQuery]);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => String(p.id) === String(selectedPatientId)) || patients[0] || null;
  }, [patients, selectedPatientId]);

  const currentMessages = useMemo(() => {
    if (!selectedPatient) return [];
    return conversations[selectedPatient.id.toString()] || [];
  }, [conversations, selectedPatient]);

  const dynamicTemplates = useMemo(() => {
    const name = selectedPatient?.nombre || 'Paciente';
    const nextAppt = selectedPatient?.proximaCita || 'tu próximo turno';
    return [
      {
        label: 'Indicaciones previas',
        text: `Hola ${name}, te envío estas indicaciones: recordá realizar ayuno de 8 hs previas, asistir con la piel limpia sin cremas ni maquillaje y traer ropa cómoda.`,
      },
      {
        label: 'Cuidados en casa',
        text: `Hola ${name}, te envío estas indicaciones: aplicá frío local de forma intermitente (15 min cada 2 hs), descansá con la cabecera elevada y evitá realizar esfuerzos físicos.`,
      },
      {
        label: 'Consulta de seguimiento',
        text: `Hola ${name}, ¿cómo te sentís hoy y cómo notás la evolución desde nuestra última sesión?`,
      },
      {
        label: 'Recordatorio de turno',
        text: `Hola ${name}, te recuerdo que tu próxima sesión es el ${nextAppt}. Cualquier consulta escribime por acá.`,
      },
    ];
  }, [selectedPatient]);

  const handleSelectPatient = (id: string | number) => {
    setSelectedPatientId(id);
    setMobileView('chat');
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedPatient) return;

    const timeString = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      text: inputText.trim(),
      timestamp: timeString,
      status: 'delivered',
    };

    const patientKey = selectedPatient.id.toString();
    setConversations((prev) => ({
      ...prev,
      [patientKey]: [...(prev[patientKey] || []), newMessage],
    }));

    setInputText('');
    toast.success('Mensaje enviado', {
      duration: 1600,
      position: 'bottom-center',
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedPatient) return;
    const patientKey = selectedPatient.id.toString();

    setConversations((prev) => ({
      ...prev,
      [patientKey]: (prev[patientKey] || []).filter((m) => m.id !== messageId),
    }));

    toast('Mensaje eliminado', {
      duration: 1500,
      position: 'bottom-center',
    });
  };

  return (
    <div className="animate-fade-in w-full space-y-4">
      <div className="pb-3 border-b border-[#E8DDD5] flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
            Mensajería postoperatoria
          </h1>
          <p className="text-sm text-[#7D726D] mt-0.5 num">
            Canal directo de seguimiento clínico e indicaciones domiciliarias ({filteredPatients.length} pacientes activos)
          </p>
        </div>
      </div>

      <div className="ledger-panel h-[calc(100dvh-12.5rem)] min-h-[520px] flex overflow-hidden relative">
        {/* Columna izquierda: Lista de pacientes */}
        <div
          className={`w-full md:w-64 lg:w-80 border-r border-[#E8DDD5] flex flex-col min-h-0 shrink-0 bg-[#FAF7F5]/50 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-[#E8DDD5] bg-[#ffffff] shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-[#7D726D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar paciente o DNI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#E8DDD5]">
            {loading ? (
              <div className="p-6 text-center text-xs text-[#7D726D]">
                Cargando conversaciones...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#7D726D]">
                No se encontraron pacientes
              </div>
            ) : (
              filteredPatients.map((p) => {
                const isSelected = String(p.id) === String(selectedPatient?.id) && mobileView === 'chat';
                const initials = `${p.nombre[0] || ''}${p.apellido[0] || ''}`.toUpperCase() || 'PA';
                const pKey = p.id.toString();
                const lastMsg = conversations[pKey]?.[conversations[pKey].length - 1];

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPatient(p.id)}
                    className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-[#e4e2dd] border-l-2 border-[#2A2421]'
                        : 'hover:bg-[#eae8e3]/70 bg-[#ffffff]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-[6px] flex items-center justify-center text-xs font-semibold shrink-0 border ${
                        isSelected
                          ? 'bg-[#C5A059] text-[#ffffff] border-[#C5A059]'
                          : 'bg-[#FAF7F5] text-[#2A2421] border-[#E8DDD5]'
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#2A2421] truncate">
                          {p.apellido}, {p.nombre}
                        </span>
                        {lastMsg && (
                          <span className="num text-xs text-[#7D726D] shrink-0">
                            {lastMsg.timestamp}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-[#1d5fbf] truncate mt-0.5">
                        {p.procedimiento}
                      </p>

                      <p className="text-xs text-[#7D726D] truncate mt-0.5">
                        {lastMsg ? lastMsg.text : p.proximaCita}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Columna central: Conversación activa */}
        {selectedPatient ? (
          <div
            className={`flex-1 flex flex-col min-w-0 min-h-0 bg-[#ffffff] ${
              mobileView === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="px-4 py-2.5 border-b border-[#E8DDD5] flex items-center justify-between gap-2 bg-[#ffffff] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 -ml-1 rounded-[6px] text-[#2A2421] hover:bg-[#FAF7F5] transition-colors shrink-0"
                  aria-label="Volver a lista de pacientes"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-8 h-8 rounded-[6px] bg-[#C5A059] text-[#ffffff] font-semibold text-xs flex items-center justify-center shrink-0">
                  {selectedPatient.nombre[0]}
                  {selectedPatient.apellido[0]}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-[#2A2421] truncate">
                    {selectedPatient.nombre} {selectedPatient.apellido}
                  </h2>
                  <p className="text-xs text-[#7D726D] truncate">
                    {selectedPatient.procedimiento}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowHistoryPanel((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-xs font-medium border transition-colors ${
                    showHistoryPanel
                      ? 'bg-[#C5A059] text-[#ffffff] border-[#C5A059]'
                      : 'bg-[#ffffff] text-[#2A2421] border-[#E8DDD5] hover:border-[#2A2421]'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sesiones previas</span>
                </button>

                {selectedPatient.telefono && (
                  <a
                    href={`tel:${selectedPatient.telefono}`}
                    className="p-1.5 rounded-[6px] bg-[#FAF7F5] text-[#2A2421] border border-[#E8DDD5] hover:border-[#2A2421] transition-colors"
                    title={`Llamar a ${selectedPatient.telefono}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 flex overflow-hidden relative">
              <div className="flex-1 flex flex-col min-w-0 min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#FAF7F5]/60">
                  <div className="px-3 py-2 rounded-[6px] bg-[#ffffff] border border-[#E8DDD5] flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-[#7D726D] shrink-0" />
                      <span className="text-[#2A2421] font-semibold shrink-0">
                        Próxima sesión:
                      </span>
                      <span className="text-[#7D726D] truncate num">
                        {selectedPatient.proximaCita}
                      </span>
                    </div>
                    <span className="badge-active hidden sm:inline-flex text-xs px-2 py-0.5 shrink-0 num">
                      {selectedPatient.progresoSesion}
                    </span>
                  </div>

                  {currentMessages.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-[#7D726D]">
                      <MessageSquareHeart className="w-7 h-7 text-[#7D726D] mb-1.5" />
                      <p className="text-sm font-semibold text-[#2A2421]">
                        Sin mensajes previos
                      </p>
                      <p className="text-xs text-[#7D726D] mt-0.5 max-w-xs">
                        Escribí un mensaje o seleccioná una plantilla clínica para {selectedPatient.nombre}.
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((msg) => {
                      const isDoctor = msg.sender === 'doctor';

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col group ${isDoctor ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`relative max-w-[88%] sm:max-w-md lg:max-w-lg px-3.5 py-2.5 rounded-[8px] text-xs sm:text-sm leading-relaxed border ${
                              isDoctor
                                ? 'bg-[#eae8e3] text-[#2A2421] border-[#E8DDD5]'
                                : 'bg-[#ffffff] text-[#2A2421] border-[#E8DDD5]'
                            }`}
                          >
                            <p className="pr-5 break-words text-[#2A2421]">{msg.text}</p>

                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="Eliminar mensaje"
                              className="absolute top-2 right-1.5 p-1 rounded-[4px] opacity-75 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[#7D726D] hover:text-[#991b1b]"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            <div className="flex items-center justify-end gap-1 mt-1 text-xs text-[#7D726D] num">
                              <span>{msg.timestamp}</span>
                              {isDoctor && (
                                <CheckCheck className="w-3.5 h-3.5 text-[#2A2421]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Barra de plantillas rápidas */}
                <div className="px-3 py-2 border-t border-[#E8DDD5] flex items-center gap-1.5 overflow-x-auto bg-[#ffffff] shrink-0">
                  <span className="text-xs font-medium text-[#7D726D] shrink-0">
                    Plantillas:
                  </span>
                  {dynamicTemplates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(tpl.text)}
                      className="px-2.5 py-1 text-xs font-medium rounded-[4px] bg-[#FAF7F5] hover:bg-[#e4e2dd] text-[#2A2421] border border-[#E8DDD5] transition-colors shrink-0 whitespace-nowrap"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                {/* Formulario de envío */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-[#E8DDD5] bg-[#ffffff] shrink-0"
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder={`Escribir indicación para ${selectedPatient.nombre}...`}
                      className="input-field flex-1 resize-none min-h-[38px] max-h-[84px]"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="btn-primary h-[38px] px-3.5 text-xs shrink-0"
                      aria-label="Enviar mensaje"
                    >
                      <span className="hidden sm:inline">Enviar</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

              {showHistoryPanel && (
                <div
                  data-ui="drawer"
                  className="absolute inset-y-0 right-0 z-20 w-full sm:w-80 border-l border-[#E8DDD5] bg-[#FAF7F5] flex flex-col overflow-y-auto p-4 space-y-3 xl:static shrink-0"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E8DDD5]">
                    <h3 className="text-xs font-semibold text-[#2A2421]">
                      Sesiones previas ({selectedPatient.sesionesPrevias.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowHistoryPanel(false)}
                      className="p-1 rounded-[4px] text-[#7D726D] hover:text-[#2A2421]"
                      title="Cerrar historial"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {selectedPatient.sesionesPrevias.map((ses, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-[6px] bg-[#ffffff] border border-[#E8DDD5] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-[#2A2421]">
                            {ses.sesion}
                          </span>
                          <span className="num text-xs text-[#7D726D]">
                            {ses.fecha}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-[#1d5fbf]">
                          Motivo: {ses.motivo}
                        </p>

                        <p className="text-xs text-[#2A2421] leading-snug">
                          {ses.resumenClinico}
                        </p>

                        <p className="text-xs text-[#7D726D] pt-1 border-t border-[#E8DDD5]">
                          "{ses.observacionCirujana}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#7D726D]">
            <User className="w-10 h-10 text-[#7D726D] mb-2" />
            <h3 className="text-sm font-semibold text-[#2A2421]">
              Seleccioná un paciente
            </h3>
            <p className="text-xs text-[#7D726D] mt-1">
              Elegí una conversación para consultar el canal postoperatorio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mensajeria;
