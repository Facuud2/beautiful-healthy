import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { PacientePortal, NotaMedica } from "../types";
import { MOCK_PACIENTES } from "../mockData";
import { AGENDADAS_STORAGE_KEY, Consulta } from "../../pages/Consultas";

export type PortalTab = "inicio" | "documentos" | "notas" | "perfil";

export interface ProximaSesionAgendada {
  id: string;
  fecha: string;
  motivo: string;
  profesional: string;
  lugar: string;
  indicaciones: string;
}

interface PatientContextType {
  currentPatient: PacientePortal | null;
  allPatients: PacientePortal[];
  isAuthenticated: boolean;
  activeTab: PortalTab;
  setActiveTab: (tab: PortalTab) => void;
  login: (dni: string, pass: string) => { success: boolean; message?: string };
  loginDemo: (patientId?: string) => void;
  logout: () => void;
  switchPatient: (patientId: string) => void;
  markNotaAsRead: (notaId: string) => void;
  sendPatientMessage: (texto: string) => void;
  unreadNotesCount: number;
  proximasSesionesAgendadas: ProximaSesionAgendada[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const STORAGE_KEY = "beautiful_health_portal_paciente_id";

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [patients, setPatients] = useState<PacientePortal[]>(() => {
    return MOCK_PACIENTES;
  });

  const [currentPatientId, setCurrentPatientId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) || "pac-01";
  });

  const [activeTab, setActiveTab] = useState<PortalTab>("inicio");
  const [scheduledVersion, setScheduledVersion] = useState(0);

  const currentPatient =
    patients.find((p) => p.id === currentPatientId) || patients[0] || null;
  const isAuthenticated = !!currentPatientId;

  useEffect(() => {
    if (currentPatientId) {
      localStorage.setItem(STORAGE_KEY, currentPatientId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentPatientId]);

  useEffect(() => {
    const handleSessionsUpdated = () => {
      setScheduledVersion((v) => v + 1);
    };
    window.addEventListener("beautiful-health-sessions-updated", handleSessionsUpdated);
    window.addEventListener("storage", handleSessionsUpdated);
    return () => {
      window.removeEventListener("beautiful-health-sessions-updated", handleSessionsUpdated);
      window.removeEventListener("storage", handleSessionsUpdated);
    };
  }, []);

  const cleanDni = (val: string) => val.replace(/\D/g, "");

  // Compute upcoming scheduled sessions & indications assigned by the doctor in Agenda de Sesiones
  const proximasSesionesAgendadas = useMemo<ProximaSesionAgendada[]>(() => {
    if (!currentPatient) return [];
    const patientCleanDni = cleanDni(currentPatient.dni);
    const items: ProximaSesionAgendada[] = [];

    try {
      const raw = localStorage.getItem(AGENDADAS_STORAGE_KEY);
      if (raw) {
        const list: Consulta[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list
            .filter(
              (c) =>
                c.estado === "pendiente" &&
                (cleanDni(c.dni || "") === patientCleanDni ||
                  c.paciente.toLowerCase() === currentPatient.nombre.toLowerCase())
            )
            .forEach((c) => {
              items.push({
                id: c.id,
                fecha: c.fecha,
                motivo: c.motivo,
                profesional: `Dra. ${c.medico} ${c.medicoApellido}`,
                lugar: "Consultorio Av. Quintana 480, Piso 3 (Recoleta)",
                indicaciones:
                  c.tratamiento ||
                  "Asistir puntualmente al consultorio según lo acordado.",
              });
            });
        }
      }
    } catch {
      // ignore
    }

    if (currentPatient.proximoTurno) {
      const pt = currentPatient.proximoTurno;
      items.push({
        id: pt.id,
        fecha: `${pt.fecha}, ${pt.hora}`,
        motivo: pt.especialidad,
        profesional: pt.profesional,
        lugar: pt.lugar,
        indicaciones:
          pt.indicacionesPrevias ||
          "Asistir con piel limpia sin maquillaje ni cremas.",
      });
    }

    return items;
  }, [currentPatient, scheduledVersion]);

  const login = (dniInput: string, passInput: string) => {
    const clean = cleanDni(dniInput);
    if (!clean) {
      return {
        success: false,
        message: "Por favor, ingresá tu número de DNI.",
      };
    }
    const found =
      patients.find((p) => cleanDni(p.dni) === clean) || patients[0];
    if (
      passInput !== found.passwordDemo &&
      passInput !== "1234" &&
      passInput !== "paciente123"
    ) {
      return {
        success: false,
        message: "Clave incorrecta.",
      };
    }
    setCurrentPatientId(found.id);
    setActiveTab("inicio");
    return { success: true };
  };

  const loginDemo = (patientId: string = "pac-01") => {
    const found = patients.find((p) => p.id === patientId) || patients[0];
    setCurrentPatientId(found.id);
    setActiveTab("inicio");
  };

  const logout = () => {
    setCurrentPatientId(null);
    setActiveTab("inicio");
  };

  const switchPatient = (patientId: string) => {
    if (patients.some((p) => p.id === patientId)) {
      setCurrentPatientId(patientId);
    }
  };

  const markNotaAsRead = (notaId: string) => {
    if (!currentPatient) return;
    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return {
          ...pat,
          notas: pat.notas.map((n) =>
            n.id === notaId ? { ...n, leida: true } : n
          ),
        };
      })
    );
  };

  const sendPatientMessage = (texto: string) => {
    if (!currentPatient || !texto.trim()) return;
    const now = new Date();
    const hora = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const nuevaNotaPaciente: NotaMedica = {
      id: `msg-${Date.now()}`,
      fecha: "Hoy",
      hora: `${hora} hs`,
      remitente: "paciente",
      profesional: {
        nombre: `${currentPatient.nombre} ${currentPatient.apellido}`,
        especialidad: "Paciente",
        matricula: "",
      },
      titulo: "Mensaje",
      etapa: "Acompañamiento Diario",
      mensaje: texto.trim(),
      importancia: "media",
      leida: true,
    };

    setPatients((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return {
          ...pat,
          notas: [...pat.notas, nuevaNotaPaciente],
        };
      })
    );
  };

  const unreadNotesCount = currentPatient
    ? currentPatient.notas.filter((n) => !n.leida).length
    : 0;

  return (
    <PatientContext.Provider
      value={{
        currentPatient,
        allPatients: patients,
        isAuthenticated,
        activeTab,
        setActiveTab,
        login,
        loginDemo,
        logout,
        switchPatient,
        markNotaAsRead,
        sendPatientMessage,
        unreadNotesCount,
        proximasSesionesAgendadas,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientPortal = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error(
      "usePatientPortal debe ser utilizado dentro de un PatientProvider"
    );
  }
  return context;
};
