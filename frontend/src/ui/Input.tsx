import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  variant?: "default" | "filled";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, variant = "default", ...props }, ref) => {
    const baseClasses =
      "w-full px-3 py-2 text-sm rounded-[6px] border bg-[#ffffff] text-[#0a0a0a] placeholder:text-[#595959] transition-colors duration-150 focus:outline-none disabled:opacity-50";

    const variantClasses = {
      default: error
        ? "border-[#991b1b] focus:border-[#991b1b]"
        : "border-[#d4d2cd] focus:border-[#0a0a0a]",
      filled: error
        ? "border-[#991b1b] bg-[#faeaea]"
        : "border-[#d4d2cd] bg-[#f4f3f1] focus:bg-[#ffffff] focus:border-[#0a0a0a]",
    };

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
