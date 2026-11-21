import React from "react";
import { usePatientPortal } from "../context/PatientContext";
import {
  FileText,
  MessageSquare,
  Calendar,
  MapPin,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export const PatientDashboardView: React.FC = () => {
  const {
    currentPatient,
    setActiveTab,
    markNotaAsRead,
    proximasSesionesAgendadas,
  } = usePatientPortal();

  if (!currentPatient) return null;

  const doctorNotes = currentPatient.notas.filter(
    (n) => n.remitente !== "paciente"
  );
  const latestNote =
    doctorNotes[doctorNotes.length - 1] || currentPatient.notas[0];

  const nextScheduled = proximasSesionesAgendadas[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-[#E8DDD5] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2A2421]">
            Seguimiento postoperatorio · {currentPatient.nombre} {currentPatient.apellido}
          </h1>
          <p className="text-sm text-[#7D726D] mt-1 num">
            {currentPatient.procedimientoPrincipal} · {proximasSesionesAgendadas.length} controles programados
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("notas")}
          className="btn-secondary text-xs shrink-0"
        >
          <span className="text-[#C5A059]">●</span>
          <span>{currentPatient.medicaCabecera.nombre}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#C5A059]" />
        </button>
      </div>

      {/* Mensaje directo de la cirujana */}
      {latestNote && (
        <div
          onClick={() => {
            markNotaAsRead(latestNote.id);
            setActiveTab("notas");
          }}
          className="cursor-pointer p-4 sm:p-5 rounded-[16px] border border-[#C5A059]/40 bg-[#F9E6E8]/60 shadow-subtle hover:border-[#C5A059] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 text-white mt-0.5 bg-[#C5A059] shadow-subtle"
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#801B2B]">
                  Mensaje directo · {currentPatient.medicaCabecera.nombre}
                </span>
                {!latestNote.leida && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#C5A059] text-white">
                    Nuevo
                  </span>
                )}
                <span className="num text-xs text-[#7D726D]">
                  · {latestNote.fecha} ({latestNote.hora})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#2A2421] mt-1 leading-relaxed font-medium">
                {latestNote.mensaje}
              </p>
            </div>
          </div>

          <div className="btn-secondary text-xs shrink-0 self-start sm:self-center shadow-subtle">
            <span>Abrir canal</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab("documentos")}
          className="interactive-card cursor-pointer p-4 sm:p-5 flex items-center justify-between gap-4"
        >
          <div>
            <span className="num text-base font-semibold text-[#0a0a0a] block">
              Próximas sesiones agendadas ({proximasSesionesAgendadas.length})
            </span>
            <span className="block text-xs text-[#595959] mt-0.5">
              Horarios confirmados y preparación previa para cada control
            </span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#595959] shrink-0" />
        </div>

        <div
          onClick={() => setActiveTab("documentos")}
          className="interactive-card cursor-pointer p-4 sm:p-5 flex items-center justify-between gap-4"
        >
          <div>
            <span className="text-base font-semibold text-[#0a0a0a] block">
              Hoja de cuidados postoperatorios
            </span>
            <span className="block text-xs text-[#595959] mt-0.5">
              Pautas de crioterapia, posición de reposo y medicación
            </span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#595959] shrink-0" />
        </div>
      </div>

      {/* Próxima sesión */}
      {nextScheduled && (
        <div className="ledger-panel p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#1d5fbf] block">
                Próximo control en consultorio
              </span>
              <h2 className="font-semibold text-[#0a0a0a] text-base">
                {nextScheduled.motivo}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#595959] num pt-1">
                <span className="flex items-center gap-1.5 font-medium text-[#0a0a0a]">
                  <Calendar className="w-3.5 h-3.5 text-[#595959]" />
                  {nextScheduled.fecha}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#595959]" />
                  {nextScheduled.lugar}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("documentos")}
              className="btn-secondary text-xs self-start md:self-center shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver preparación</span>
            </button>
          </div>

          {nextScheduled.indicaciones && (
            <div className="mt-3 pt-3 border-t border-[#e6e6e6] text-xs text-[#0a0a0a] bg-[#f4f3f1] p-3 rounded-[6px]">
              <strong className="font-semibold">
                Indicaciones para esta sesión:
              </strong>{" "}
              {nextScheduled.indicaciones}
            </div>
          )}
        </div>
      )}

      {/* Historial de sesiones previas */}
      <div className="ledger-panel p-5 space-y-4">
        <div className="pb-3 border-b border-[#e6e6e6]">
          <h2 className="text-base font-semibold text-[#0a0a0a]">
            Actas de sesiones realizadas ({currentPatient.sesiones.length})
          </h2>
          <p className="text-xs text-[#595959] mt-0.5">
            Resumen evolutivo registrado en tu historia clínica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentPatient.sesiones.map((ses) => (
            <div
              key={ses.id}
              className="p-4 rounded-[6px] bg-[#f4f3f1]/70 border border-[#e6e6e6] space-y-2"
            >
              <span className="num text-xs font-medium text-[#595959] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {ses.fecha}
              </span>
              <h3 className="text-sm font-semibold text-[#0a0a0a]">
                {ses.titulo}
              </h3>
              <p className="text-xs text-[#595959] leading-relaxed">
                {ses.descripcion}
              </p>
              <div className="p-2.5 rounded-[4px] bg-[#ffffff] border border-[#e6e6e6] text-xs text-[#0a0a0a]">
                <span className="text-[#595959] block font-medium mb-0.5">
                  Conclusión clínica:
                </span>
                {ses.evaluacion.conclusion}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
