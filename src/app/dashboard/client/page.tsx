"use client";

import { motion } from "framer-motion";
import ClientOverview from "@/components/dashboard/client/ClientOverview";
import { useRef, useEffect, useState } from "react";

export default function ClientDashboard() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particlePositions, setParticlePositions] = useState<
    Array<{ x: string; y: string }>
  >([]);

  // Generar posiciones de partículas de forma estable para SSR
  useEffect(() => {
    setIsVisible(true);

    // Generar posiciones fijas para las partículas
    const positions = Array.from({ length: 20 }, (_, i) => ({
      x: `${(i * 47) % 100}%`, // Patrón determinístico en lugar de Math.random()
      y: `${(i * 23) % 100}%`,
    }));
    setParticlePositions(positions);

    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-6 relative overflow-hidden"
    >
      {/* Efecto de partículas de fondo - solo en cliente */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particlePositions.map((position, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
            initial={{
              x: position.x,
              y: position.y,
              scale: 0,
            }}
            animate={{
              x: [`${position.x}`, `${(parseFloat(position.x) + 30) % 100}%`],
              y: [`${position.y}`, `${(parseFloat(position.y) + 20) % 100}%`],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 10 + i * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Efecto de luz que sigue el cursor */}
      <motion.div
        className="absolute pointer-events-none w-96 h-96 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-3xl"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
        }}
      />

      {/* Header con efectos espectaculares */}
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={
          isVisible
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 50, scale: 0.8 }
        }
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.8,
        }}
        className="mb-8 relative"
      >
        {/* Efecto de fondo animado para el header */}
        <motion.div
          initial={{ backgroundPosition: "0% 50%", opacity: 0 }}
          animate={
            isVisible
              ? {
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  opacity: 1,
                }
              : { backgroundPosition: "0% 50%", opacity: 0 }
          }
          transition={{
            backgroundPosition: {
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            },
            opacity: {
              duration: 1.5,
              ease: "easeOut",
            },
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5 bg-[length:200%_200%] blur-xl"
        />

        <div className="relative z-10">
          <motion.h1
            animate={
              isVisible
                ? {
                    y: [-10, 10, -10],
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                  }
                : { y: 0 }
            }
            transition={{
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
              backgroundPosition: {
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            className="text-5xl font-bold mb-4 text-center relative"
            style={{
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
              backgroundSize: "200% 200%",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Mis Solicitudes
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
            className="h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent mb-4"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-xl text-gray-400 text-center relative"
          >
            <motion.span
              animate={
                isVisible
                  ? {
                      textShadow: [
                        "0 0 0px rgba(255,255,255,0)",
                        "0 0 10px rgba(255,255,255,0.3)",
                        "0 0 0px rgba(255,255,255,0)",
                      ],
                    }
                  : { textShadow: "0 0 0px rgba(255,255,255,0)" }
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Solicita servicios y revisa el estado de tus peticiones
            </motion.span>
          </motion.p>

          {/* Elementos decorativos flotantes */}
          <motion.div
            className="absolute -top-4 -left-4 w-8 h-8 bg-primary-500 rounded-full opacity-20"
            animate={
              isVisible
                ? {
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }
                : { scale: 1, opacity: 0.2 }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-4 -right-4 w-6 h-6 bg-secondary-500 rounded-full opacity-20"
            animate={
              isVisible
                ? {
                    scale: [1, 2, 1],
                    opacity: [0.2, 0.3, 0.2],
                    rotate: [0, 180, 360],
                  }
                : { scale: 1, opacity: 0.2, rotate: 0 }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </motion.div>

      {/* Contenido principal con entrada espectacular */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={
          isVisible
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 50, scale: 0.8 }
        }
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.8,
        }}
        className="relative"
      >
        {/* Efecto de borde luminoso */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl blur-lg"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800/50 p-6 shadow-2xl"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 },
          }}
        >
          {/* Efecto de brillo interno */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
            animate={
              isVisible
                ? {
                    opacity: [0.05, 0.1, 0.05],
                  }
                : { opacity: 0.05 }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <ClientOverview />
        </motion.div>
      </motion.div>

      {/* Efectos de partículas laterales */}
      <motion.div
        className="absolute left-0 top-1/2 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"
        animate={
          isVisible
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }
            : { scale: 1, opacity: 0.3 }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-0 bottom-1/4 w-40 h-40 bg-secondary-500/10 rounded-full blur-2xl"
        animate={
          isVisible
            ? {
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.2, 0.4],
              }
            : { scale: 1.2, opacity: 0.4 }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
