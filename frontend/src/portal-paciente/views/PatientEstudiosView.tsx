import React, { useState } from "react";
import { usePatientPortal } from "../context/PatientContext";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

export const PatientEstudiosView: React.FC = () => {
  const { currentPatient } = usePatientPortal();

  if (!currentPatient) return null;

  const sesiones = currentPatient.sesiones;
  const [leftId, setLeftId] = useState<string>(sesiones[0]?.id || "ses-01");
  const [rightId, setRightId] = useState<string>(
    sesiones[sesiones.length - 1]?.id || "ses-03"
  );

  const leftSes = sesiones.find((s) => s.id === leftId) || sesiones[0];
  const rightSes =
    sesiones.find((s) => s.id === rightId) || sesiones[sesiones.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="luxury-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#F9E6E8] text-[#C97A85] mb-1.5">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>Comparativa de Progreso Estético</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#2A2421]">
            Mi Evolución Sesión por Sesión
          </h2>
          <p className="text-xs text-[#7D726D] mt-0.5">
            Visualizá con lujo de detalles cómo evoluciona tu tratamiento entre cada sesión con la{" "}
            <strong className="text-[#2A2421]">
              {currentPatient.medicaCabecera.nombre}
            </strong>
          </p>
        </div>
      </div>

      {/* Interactive Side-by-Side Session Comparator */}
      {leftSes && rightSes && (
        <div className="luxury-card p-5 sm:p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E8DDD5]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A059]">
              <SlidersHorizontal className="w-4 h-4" />
              <span>COMPARADOR INTERACTIVO DE SESIONES</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F4EBE6] text-[#2A2421] border border-[#E8DDD5]"
              >
                {sesiones.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sesión {s.numeroSesion} ({s.etapa} - {s.fecha})
                  </option>
                ))}
              </select>
              <span className="text-xs font-semibold text-[#C5A059]">vs.</span>
              <select
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F9E6E8] text-[#2A2421] border border-[#C5A059]"
              >
                {sesiones.map((s) => (
                  <option key={s.id} value={s.id}>
                    Sesión {s.numeroSesion} ({s.etapa} - {s.fecha})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[leftSes, rightSes].map((ses, idx) => (
              <div
                key={`${ses.id}-${idx}`}
                className={`p-5 rounded-2xl border space-y-3.5 ${
                  idx === 1
                    ? "bg-[#FAF7F5] border-[#C5A059]"
                    : "bg-[#FFFFFF] border-[#EFE6DF]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#C5A059] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ses.fecha}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      ses.etapa === "Pre-Cirugía"
                        ? "bg-[#FDF3E7] text-[#B8860B]"
                        : "bg-[#E8F3EE] text-[#3B7A57]"
                    }`}
                  >
                    {ses.etapa}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#2A2421]">
                  {ses.titulo}
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#F4EBE6] border border-[#E8DDD5]">
                    <span className="text-[10px] font-semibold uppercase text-[#7D726D] block">
                      Edema & Desinflamación
                    </span>
                    <span className="font-semibold text-[#2A2421]">
                      {ses.evaluacion.edema}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F4EBE6] border border-[#E8DDD5]">
                    <span className="text-[10px] font-semibold uppercase text-[#7D726D] block">
                      Simetría & Contorno
                    </span>
                    <span className="font-semibold text-[#2A2421]">
                      {ses.evaluacion.simetria}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#E8F3EE] border border-[#E8DDD5]">
                    <span className="text-[10px] font-semibold uppercase text-[#3B7A57] block">
                      Calidad de Piel & Cicatrización
                    </span>
                    <span className="font-semibold text-[#3B7A57]">
                      {ses.evaluacion.calidadPiel}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#7D726D] leading-relaxed">
                  {ses.evaluacion.resumen}
                </p>

                <div className="p-3 rounded-xl bg-[#F9E6E8] border border-[#E8DDD5] text-xs text-[#2A2421]">
                  <strong className="text-[#C97A85] font-semibold">
                    Conclusión de la Dra. Valdez:
                  </strong>{" "}
                  {ses.evaluacion.conclusion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Session List */}
      <div className="space-y-3">
        {sesiones.map((ses) => (
          <div
            key={ses.id}
            className="luxury-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C5A059]" />
                <h4 className="text-sm font-semibold text-[#2A2421]">
                  {ses.titulo}
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F3EE] text-[#3B7A57]">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  Completada ({ses.fecha})
                </span>
              </div>
              <p className="text-xs text-[#7D726D]">{ses.descripcion}</p>
            </div>

            <button
              onClick={() => setRightId(ses.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F9E6E8] text-[#C97A85] border border-[#C5A059] shrink-0"
            >
              Comparar esta sesión
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
