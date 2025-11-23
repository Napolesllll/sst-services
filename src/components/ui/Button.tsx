"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type MotionButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

interface ButtonProps extends Omit<MotionButtonProps, "children"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 select-none";

  const variantClasses: Record<string, string> = {
    primary: `
      bg-blue-600 
      text-white 
      shadow-[0_0_12px_rgba(0,150,255,0.3)]
      hover:shadow-[0_0_16px_rgba(0,180,255,0.45)]
    `,
    secondary: `
      bg-gray-800 
      text-gray-200 
      border border-gray-600
      hover:bg-gray-700 
      hover:border-gray-500
      shadow-[0_0_10px_rgba(255,255,255,0.15)]
    `,
    outline: `
      bg-transparent 
      border border-white/40 
      text-white
      hover:bg-white/10
      shadow-[0_0_12px_rgba(255,255,255,0.2)]
    `,
    ghost: `
      bg-transparent 
      text-gray-300
      hover:bg-white/10
      hover:text-white
    `,
  };

  const sizeClasses: Record<string, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.06 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.94 }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
