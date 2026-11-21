import React, { useState, useRef, useEffect } from "react";
import { usePatientPortal } from "../context/PatientContext";
import {
  CheckCircle2,
  Send,
  CheckCheck,
} from "lucide-react";

export const PatientNotasView: React.FC = () => {
  const { currentPatient, markNotaAsRead, sendPatientMessage } =
    usePatientPortal();
  const [messageText, setMessageText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentPatient) {
      currentPatient.notas.forEach((n) => {
        if (!n.leida) markNotaAsRead(n.id);
      });
    }
  }, [currentPatient, markNotaAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentPatient?.notas.length]);

  if (!currentPatient) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendPatientMessage(messageText);
    setMessageText("");
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-[#E8DDD5] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2A2421]">
            Canal directo · {currentPatient.medicaCabecera.nombre}
          </h1>
          <p className="text-xs text-[#7D726D] mt-0.5">
            {currentPatient.medicaCabecera.especialidad} · Respuesta prioritaria a pacientes postoperatorios
          </p>
        </div>
        <span className="badge-active inline-flex items-center gap-1 px-2.5 py-0.5 text-xs shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          En línea
        </span>
      </div>

      <div className="ledger-panel flex flex-col h-[calc(100dvh-13.5rem)] min-h-[380px] max-h-[680px] overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[#FAF7F5]/60">
          {currentPatient.notas.map((nota) => {
            const isPatient = nota.remitente === "paciente";
            return (
              <div
                key={nota.id}
                className={`flex flex-col ${isPatient ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-md px-3.5 py-2.5 rounded-[8px] text-xs sm:text-sm leading-relaxed border ${
                    isPatient
                      ? "bg-[#eae8e3] text-[#2A2421] border-[#E8DDD5]"
                      : "bg-[#ffffff] text-[#2A2421] border-[#E8DDD5]"
                  }`}
                >
                  <p className="break-words text-[#2A2421]">{nota.mensaje}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-xs text-[#7D726D] num">
                    <span>
                      {nota.fecha} · {nota.hora}
                    </span>
                    {isPatient && <CheckCheck className="w-3.5 h-3.5 text-[#2A2421]" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-[#E8DDD5] bg-[#ffffff] shrink-0"
        >
          <div className="flex items-end gap-2">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              rows={1}
              placeholder="Escribí una consulta sobre tu evolución..."
              className="input-field flex-1 resize-none min-h-[38px] max-h-[88px]"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="btn-primary h-[38px] px-4 text-xs shrink-0"
            >
              <span className="hidden sm:inline">Enviar</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
