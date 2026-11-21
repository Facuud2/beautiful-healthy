import React from "react";
import { usePatientPortal } from "../context/PatientContext";

export const PatientPerfilView: React.FC = () => {
  const { currentPatient } = usePatientPortal();

  if (!currentPatient) return null;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8DDD5]">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#2A2421]">
          Ficha filiatoria · {currentPatient.nombre} {currentPatient.apellido}
        </h1>
        <p className="num text-sm text-[#7D726D] mt-1">
          DNI {currentPatient.dni} · Nacimiento: {currentPatient.fechaNacimiento} ({currentPatient.edad} años)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="ledger-panel p-5 space-y-4">
          <h2 className="font-semibold text-sm text-[#2A2421] pb-2 border-b border-[#E8DDD5]">
            Datos personales y de contacto
          </h2>

          <div className="divide-y divide-[#E8DDD5] text-xs">
            <div className="py-2.5 flex justify-between gap-2">
              <span className="text-[#7D726D]">Paciente</span>
              <span className="font-semibold text-[#2A2421]">
                {currentPatient.nombre} {currentPatient.apellido}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-2">
              <span className="text-[#7D726D]">DNI</span>
              <span className="num font-semibold text-[#2A2421]">
                {currentPatient.dni}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-2">
              <span className="text-[#7D726D]">Procedimiento</span>
              <span className="font-semibold text-[#2A2421] text-right">
                {currentPatient.procedimientoPrincipal}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-2">
              <span className="text-[#7D726D]">Correo electrónico</span>
              <span className="font-semibold text-[#2A2421]">
                {currentPatient.email}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-2">
              <span className="text-[#7D726D]">Teléfono móvil</span>
              <span className="num font-semibold text-[#2A2421]">
                {currentPatient.telefono}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-2">
              <span className="text-[#7D726D]">Domicilio</span>
              <span className="font-semibold text-[#2A2421]">
                {currentPatient.direccion}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="ledger-panel p-5 space-y-4">
            <h2 className="font-semibold text-sm text-[#2A2421] pb-2 border-b border-[#E8DDD5]">
              Equipo quirúrgico a cargo
            </h2>

            <div className="divide-y divide-[#E8DDD5] text-xs">
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-[#7D726D]">Cirujana</span>
                <span className="font-semibold text-[#2A2421]">
                  {currentPatient.medicaCabecera.nombre}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-[#7D726D]">Especialidad</span>
                <span className="font-semibold text-[#2A2421]">
                  {currentPatient.medicaCabecera.especialidad}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-[#7D726D]">Matrícula</span>
                <span className="num font-semibold text-[#2A2421]">
                  {currentPatient.medicaCabecera.matricula}
                </span>
              </div>
              <div className="py-2.5 flex justify-between gap-2">
                <span className="text-[#7D726D]">Horarios de atención</span>
                <span className="num font-semibold text-[#2A2421]">
                  {currentPatient.medicaCabecera.horariosAtencion}
                </span>
              </div>
            </div>
          </div>

          <div className="ledger-panel p-5 space-y-3">
            <h2 className="font-semibold text-sm text-[#2A2421] pb-2 border-b border-[#E8DDD5]">
              Antecedentes clínicos registrados
            </h2>

            <ul className="space-y-2 text-xs">
              {currentPatient.antecedentes.map((ant, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-[6px] bg-[#FAF7F5] border border-[#E8DDD5] text-[#2A2421] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A2421] shrink-0" />
                  <span>{ant}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
