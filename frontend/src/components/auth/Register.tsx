"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(1, "El usuario es obligatorio"),
    email: z
      .string()
      .email("El correo electrónico no es válido")
      .min(1, "El correo electrónico es obligatorio"),
    contrasena: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmContrasena: z.string().min(1, "Por favor repetí la contraseña"),
  })
  .refine((data) => data.contrasena === data.confirmContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmContrasena"],
  });

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f3f1] flex items-center justify-center p-4">
      <div className="w-full max-w-md ledger-panel p-6 sm:p-8">
        <div className="pb-4 mb-5 border-b border-[#e6e6e6]">
          <h1 className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
            Alta de profesional médico
          </h1>
          <p className="text-xs text-[#595959] mt-1">
            Habilitación de credenciales para cirujanos y especialistas del equipo
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
              htmlFor="name"
              className="block text-xs font-medium text-[#595959] mb-1"
            >
              Nombre de usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="name"
                {...register("name")}
                placeholder="vmontes"
                className="input-field pl-9"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-[#991b1b] mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-[#595959] mb-1"
            >
              Correo institucional
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="valeria.montes@consultoriomontes.ar"
                className="input-field pl-9"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-[#991b1b] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contrasena"
              className="block text-xs font-medium text-[#595959] mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="contrasena"
                type="password"
                {...register("contrasena")}
                placeholder="••••••••"
                className="input-field pl-9"
              />
            </div>
            {errors.contrasena && (
              <p className="text-xs text-[#991b1b] mt-1">
                {errors.contrasena.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmContrasena"
              className="block text-xs font-medium text-[#595959] mb-1"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#595959]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmContrasena"
                type="password"
                {...register("confirmContrasena")}
                placeholder="••••••••"
                className="input-field pl-9"
              />
            </div>
            {errors.confirmContrasena && (
              <p className="text-xs text-[#991b1b] mt-1">
                {errors.confirmContrasena.message}
              </p>
            )}
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5"
            >
              Crear cuenta profesional
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-secondary w-full py-2 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al inicio de sesión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;