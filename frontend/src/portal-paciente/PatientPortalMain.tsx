import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePatientPortal } from "./context/PatientContext";
import { PatientHeader } from "./components/PatientHeader";
import { PatientDashboardView } from "./views/PatientDashboardView";
import { PatientDocumentosView } from "./views/PatientDocumentosView";
import { PatientNotasView } from "./views/PatientNotasView";
import { PatientPerfilView } from "./views/PatientPerfilView";
import {
  LoadingFeedback,
  PageTransition,
} from "../components/ui/LoadingFeedback";
import { AnimatePresence } from "framer-motion";

export const PatientPortalMain: React.FC = () => {
  const { currentPatient, isAuthenticated, activeTab } = usePatientPortal();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/portal-paciente/login");
    }
  }, [isAuthenticated, navigate]);

  if (!currentPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F5]">
        <LoadingFeedback
          message="Cargando tu portal..."
          submessage="Sincronizando tus próximas sesiones e indicaciones..."
        />
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "documentos":
        return (
          <PageTransition tabKey="documentos">
            <PatientDocumentosView />
          </PageTransition>
        );
      case "notas":
        return (
          <PageTransition tabKey="notas">
            <PatientNotasView />
          </PageTransition>
        );
      case "perfil":
        return (
          <PageTransition tabKey="perfil">
            <PatientPerfilView />
          </PageTransition>
        );
      case "inicio":
      default:
        return (
          <PageTransition tabKey="inicio">
            <PatientDashboardView />
          </PageTransition>
        );
    }
  };

  return (
    <div className="h-dvh max-h-full w-full max-w-full overflow-hidden bg-[#FAF7F5] text-[#2A2421] antialiased font-sans flex flex-col">
      {/* Header and Nav */}
      <PatientHeader />

      {/* Main Content Area with animated transitions */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 h-full">
          <AnimatePresence mode="wait">{renderActiveTab()}</AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default PatientPortalMain;
