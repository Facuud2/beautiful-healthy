"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { User, Lock, ArrowRight } from "lucide-react";
import { LoadingFeedback } from "../ui/LoadingFeedback";

const loginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

const LoginForm = () => {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(data);
      navigate("/dashboard");
    } catch (error: any) {
      let errorMsg = "No se pudo verificar el acceso.";
      if (error?.response) {
        const status = error.response.status;
        if (status === 400) {
          errorMsg = "Solicitud inválida. Verificá los datos ingresados.";
        } else if (status === 401) {
          errorMsg = "Credenciales incorrectas.";
        } else if (status === 500) {
          errorMsg = "Error interno del servidor. Intentá más tarde.";
        }
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f3f1] flex items-center justify-center p-4">
      <AnimatePresence>
        {isLoading && (
          <LoadingFeedback
            fullScreen
            message="Ingresando a Beautiful Health..."
            submessage="Sincronizando agenda quirúrgica, pacientes y mensajes..."
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-md ledger-panel p-6 sm:p-8">
        <div className="pb-5 mb-6 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-2.5 mb-2">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-[#0a0a0a]"
            >
              <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.75" />
              <path d="M7.5 16.5V7.5L12 13L16.5 7.5V16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold text-[#0a0a0a]">
              Beautiful Health · Av. Quintana 480
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
            Acceso a estación quirúrgica
          </h1>
          <p className="text-xs text-[#595959] mt-1">
            Registro clínico de pacientes, agenda de sesiones y mensajería postoperatoria
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
          noValidate
        >
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-[#595959] mb-1.5"
            >
              Profesional o matrícula
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="username"
                {...register("username")}
                placeholder="vmontes"
                className="input-field pl-9"
                autoComplete="username"
              />
            </div>
            {errors.username && (
              <p className="text-xs text-[#991b1b] font-medium mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[#595959] mb-1.5"
            >
              Clave de consola
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                id="password"
                {...register("password")}
                placeholder="••••••••"
                className="input-field pl-9"
                autoComplete="current-password"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-[#991b1b] font-medium mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-[6px] bg-[#fef6e6] border border-[#f5deb3] text-[#7c4a03] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              className="btn-primary w-full py-2.5"
              disabled={isLoading}
            >
              <span>Ingresar al consultorio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="btn-secondary w-full py-2"
              onClick={() => navigate("/register")}
            >
              Alta de nuevo profesional
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;