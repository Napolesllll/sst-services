"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "futuristic" | "cyber" | "glass";
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = "futuristic",
  hover = true,
  className = "",
  onClick,
}: CardProps) {
  const variantClasses = {
    futuristic: `
      bg-black/40 
      backdrop-blur-sm 
      border border-gray-700/60
      rounded-2xl 
      p-6
      shadow-[0_0_20px_rgba(0,180,255,0.15)]
      transition-all duration-300
      hover:shadow-[0_0_25px_rgba(0,220,255,0.25)]
    `,
    cyber: `
      bg-[#0d0d0d]/90 
      border border-white/40 
      rounded-xl
      p-6
      shadow-[0_0_15px_rgba(255,255,255,0.25)]
      transition-all duration-300
      hover:shadow-[0_0_20px_rgba(255,255,255,0.35)]
      text-white
    `,
    glass: `
      bg-white/10 
      backdrop-blur-xl
      rounded-xl
      p-6
      border border-white/20
      shadow-[0_8px_25px_rgba(0,0,0,0.2)]
      transition-all duration-300
      hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)]
    `,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={hover ? { scale: 1.03, y: -4 } : {}}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`
        ${variantClasses[variant]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
