import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-[6px] transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "bg-[#faeaea] text-[#991b1b] border border-[#f2c6c6]",
    outline:
      "border border-[#d4d2cd] text-[#0a0a0a] bg-[#ffffff] hover:border-[#0a0a0a]",
    ghost: "text-[#595959] hover:text-[#0a0a0a] hover:bg-[#eae8e3]",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-4 py-2.5 gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
