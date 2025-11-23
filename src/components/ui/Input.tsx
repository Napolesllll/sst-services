"use client";

import { motion } from "framer-motion";
import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  variant?: "futuristic" | "cyber";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon, variant = "futuristic", className = "", ...props },
    ref
  ) => {
    const variantClasses = {
      futuristic: `
        bg-black/30
        border border-gray-600/50
        rounded-xl
        text-gray-200
        placeholder-gray-400
        transition-all duration-300
        focus:border-blue-500 focus:shadow-[0_0_15px_rgba(0,150,255,0.5)]
        hover:border-blue-400
      `,
      cyber: `
        bg-[#0f0f0f]/80
        border border-green-500/40
        rounded-lg
        text-green-300
        placeholder-green-600
        shadow-[0_0_10px_rgba(0,255,120,0.2)]
        transition-all duration-300
        focus:border-green-400 focus:shadow-[0_0_15px_rgba(0,255,120,0.5)]
        hover:shadow-[0_0_12px_rgba(0,255,120,0.35)]
      `,
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={`
              w-full
              py-3
              px-4
              ${icon ? "pl-10" : ""}
              ${variantClasses[variant]}
              ${
                error
                  ? "border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.4)]"
                  : ""
              }
              ${className}
            `}
            {...props}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 text-sm text-red-400 tracking-wide"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = "Input";

export default Input;
