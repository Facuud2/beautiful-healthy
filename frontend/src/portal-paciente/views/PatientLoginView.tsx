import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatientPortal } from "../context/PatientContext";
import { MOCK_PACIENTES } from "../mockData";
import { AnimatePresence } from "framer-motion";
import { CreditCard, Lock, ArrowRight } from "lucide-react";
import { LoadingFeedback } from "../../components/ui/LoadingFeedback";
import toast from "react-hot-toast";

export const PatientLoginView: React.FC = () => {
  const { login, isAuthenticated } = usePatientPortal();
  const navigate = useNavigate();

  const defaultPatient = MOCK_PACIENTES[0];
  const [dni, setDni] = useState(defaultPatient.dni);
  const [password, setPassword] = useState(defaultPatient.passwordDemo);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/portal-paciente");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = login(dni, password);
      if (res.success) {
        setTimeout(() => {
          setIsLoading(false);
          toast.success("Sesión iniciada correctamente");
          navigate("/portal-paciente");
        }, 300);
      } else {
        setIsLoading(false);
        setErrorMessage(res.message || "Error al ingresar");
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f3f1] flex items-center justify-center p-4">
      <AnimatePresence>
        {isLoading && (
          <LoadingFeedback
            fullScreen
            message="Ingresando al Portal..."
            submessage="Cargando tus sesiones agendadas, indicaciones y mensajes..."
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-md ledger-panel p-6 sm:p-8">
        <div className="pb-4 mb-5 border-b border-[#e6e6e6]">
          <h1 className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
            Portal de Paciente · Beautiful Health
          </h1>
          <p className="text-xs text-[#595959] mt-1 leading-relaxed">
            Consultá tus próximas sesiones, indicaciones postoperatorias y canal directo con tu profesional.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label
              htmlFor="dni"
              className="block text-xs font-medium text-[#595959] mb-1.5"
            >
              Número de documento (DNI)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                id="dni"
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ingresá tu DNI"
                required
                className="input-field pl-9 num"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[#595959] mb-1.5"
            >
              Clave personal
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input-field pl-9"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-[6px] bg-[#fef6e6] border border-[#f5deb3] text-[#7c4a03] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5"
            >
              <span>Ingresar al portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
