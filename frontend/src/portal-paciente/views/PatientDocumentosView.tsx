import React from "react";
import { usePatientPortal } from "../context/PatientContext";
import {
  Calendar,
  MessageSquare,
} from "lucide-react";

export const PatientDocumentosView: React.FC = () => {
  const { currentPatient, setActiveTab, proximasSesionesAgendadas } =
    usePatientPortal();

  if (!currentPatient) return null;

  const activeIndicaciones = currentPatient.indicaciones.filter(
    (ind) => ind.estado === "activo"
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8DDD5] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#2A2421]">
            Indicaciones y preparación quirúrgica
          </h1>
          <p className="text-sm text-[#7D726D] mt-1">
            Pautas prescriptas por {currentPatient.medicaCabecera.nombre} para tu recuperación ambulatoria
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("notas")}
          className="btn-primary text-xs shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Consultar por chat</span>
        </button>
      </div>

      {proximasSesionesAgendadas.length > 0 && (
        <div className="space-y-4">
          {proximasSesionesAgendadas.map((sesion) => (
            <div
              key={sesion.id}
              className="ledger-panel p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8DDD5]">
                <div>
                  <span className="text-xs font-medium text-[#1d5fbf] block">
                    Preparación para próxima sesión
                  </span>
                  <h2 className="text-base font-semibold text-[#2A2421]">
                    {sesion.motivo}
                  </h2>
                </div>

                <span className="num inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium bg-[#FAF7F5] text-[#2A2421] border border-[#E8DDD5]">
                  <Calendar className="w-3.5 h-3.5 text-[#7D726D]" />
                  {sesion.fecha}
                </span>
              </div>

              <div className="p-3.5 rounded-[6px] bg-[#FAF7F5]/70 border border-[#E8DDD5] space-y-1">
                <span className="text-xs font-medium text-[#7D726D] block">
                  Indicaciones de {sesion.profesional}:
                </span>
                <p className="text-xs sm:text-sm text-[#2A2421] leading-relaxed">
                  {sesion.indicaciones}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeIndicaciones.map((ind) => (
        <div key={ind.id} className="ledger-panel p-5 space-y-4">
          <div className="pb-3 border-b border-[#E8DDD5]">
            <span className="text-xs font-medium text-[#7D726D] block">
              Protocolo domiciliario · {ind.profesional}
            </span>
            <h2 className="text-base font-semibold text-[#2A2421] mt-0.5">
              {ind.titulo}
            </h2>
          </div>

          <div className="space-y-2.5">
            {ind.detalles.pasos.map((paso, idx) => (
              <div
                key={`${ind.id}-${idx}`}
                className="p-3.5 rounded-[6px] bg-[#FAF7F5]/70 border border-[#E8DDD5] space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-[#2A2421]">
                    {paso.accion}
                  </span>
                  <span className="num text-xs font-medium text-[#1d5fbf]">
                    {paso.momento}
                  </span>
                </div>
                <p className="text-xs text-[#7D726D] leading-relaxed">
                  {paso.recomendacion}
                </p>
              </div>
            ))}
          </div>

          {ind.detalles.observaciones && (
            <div className="p-3 rounded-[6px] bg-[#fef6e6] border border-[#f5deb3] text-xs text-[#7c4a03]">
              <strong className="font-semibold">
                Nota importante:
              </strong>{" "}
              {ind.detalles.observaciones}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
