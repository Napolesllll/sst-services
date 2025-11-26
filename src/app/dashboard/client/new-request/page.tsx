"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import ServiceRequestForm from "@/components/dashboard/client/ServiceRequestForm";

export default function NewRequestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    floating: {
      y: [-5, 5, -5],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="max-w-4xl mx-auto relative overflow-hidden"
    >
      {/* Efecto de partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-500/30 rounded-full"
            initial={{
              x: `${(i * 67) % 100}%`,
              y: `${(i * 23) % 100}%`,
              scale: 0,
            }}
            animate={{
              x: [`${(i * 67) % 100}%`, `${(i * 67 + 40) % 100}%`],
              y: [`${(i * 23) % 100}%`, `${(i * 23 + 30) % 100}%`],
              scale: [0, 1, 0],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: 8 + i * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Efecto de luz que sigue el cursor */}
      <motion.div
        className="absolute pointer-events-none w-80 h-80 rounded-full bg-gradient-to-r from-primary-500/15 to-secondary-500/15 blur-3xl"
        animate={{
          x: mousePosition.x - 160,
          y: mousePosition.y - 160,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
        }}
      />

      {/* Header espectacular */}
      <motion.div
        variants={containerVariants}
        className="mb-8 text-center relative"
      >
        {/* Efecto de fondo animado para el header */}
        <motion.div
          initial={{ backgroundPosition: "0% 50%", opacity: 0 }}
          animate={
            isVisible
              ? {
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  opacity: 0.8,
                }
              : { backgroundPosition: "0% 50%", opacity: 0 }
          }
          transition={{
            backgroundPosition: {
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            },
            opacity: {
              duration: 1.5,
              ease: "easeOut",
            },
          }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 bg-[length:200%_200%] blur-xl -z-10"
        />

        <motion.h1
          variants={floatingVariants}
          animate="floating"
          className="text-5xl md:text-6xl font-bold mb-4 relative"
          style={{
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #f5576c 60%, #4facfe 80%, #00f2fe 100%)",
            backgroundSize: "200% 200%",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            backgroundPosition: {
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          Nueva Solicitud
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
          className="h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent mb-6 mx-auto w-64"
        />

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-400 mb-6 max-w-2xl mx-auto relative"
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 0px rgba(255,255,255,0)",
                "0 0 12px rgba(255,255,255,0.3)",
                "0 0 0px rgba(255,255,255,0)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Completa el formulario y nuestro equipo asignará un profesional
            calificado
          </motion.span>
        </motion.p>

        {/* Elementos decorativos */}
        <motion.div
          className="absolute -top-2 -left-2 w-4 h-4 bg-primary-500 rounded-full opacity-40"
          animate={
            isVisible
              ? {
                  scale: [1, 1.8, 1],
                  opacity: [0.4, 0.8, 0.4],
                }
              : { scale: 1, opacity: 0.4 }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-2 -right-2 w-3 h-3 bg-secondary-500 rounded-full opacity-40"
          animate={
            isVisible
              ? {
                  scale: [1, 2, 1],
                  opacity: [0.4, 0.6, 0.4],
                  rotate: [0, 180, 360],
                }
              : { scale: 1, opacity: 0.4, rotate: 0 }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Contenedor del formulario con efectos */}
      <motion.div variants={itemVariants} className="relative">
        {/* Efecto de borde luminoso */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ delay: 1, duration: 1 }}
          className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 rounded-3xl blur-lg -z-10"
        />

        {/* Efecto de brillo interno */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-0"
          animate={
            isVisible
              ? {
                  opacity: [0.05, 0.15, 0.05],
                }
              : { opacity: 0.05 }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tarjeta principal del formulario */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{
            delay: 1.2,
            duration: 0.8,
            type: "spring",
            stiffness: 80,
          }}
          className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden"
          whileHover={{
            scale: 1.01,
            transition: { duration: 0.3 },
          }}
        >
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
                backgroundSize: "100px 100px",
              }}
            />
          </div>

          {/* Contenido del formulario */}
          <div className="relative z-10">
            <ServiceRequestForm />
          </div>
        </motion.div>
      </motion.div>

      {/* Efectos de partículas laterales */}
      <motion.div
        className="absolute left-0 top-1/3 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl -z-10"
        animate={
          isVisible
            ? {
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }
            : { scale: 1, opacity: 0.2 }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-0 bottom-1/4 w-56 h-56 bg-secondary-500/10 rounded-full blur-2xl -z-10"
        animate={
          isVisible
            ? {
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.1, 0.3],
              }
            : { scale: 1.2, opacity: 0.3 }
        }
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Línea decorativa inferior */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={
          isVisible ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
        }
        transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
        className="h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent mt-12 mx-auto w-3/4"
      />
    </motion.div>
  );
}
