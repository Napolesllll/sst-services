"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);

    // Crear partículas para el efecto de fondo
    const initialParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
    }));
    setParticles(initialParticles);

    // Mostrar "Bienvenido" después de 1.5 segundos
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 1500);

    // Redirect to login after animation
    const redirectTimer = setTimeout(() => {
      router.push("/login");
    }, 4000);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Efecto de partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Efectos de luz de fondo */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center relative z-10"
      >
        {/* Logo principal con efectos espectaculares MEJORADOS */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={
            isVisible
              ? {
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }
              : { opacity: 0, scale: 0, rotate: -180 }
          }
          transition={{
            duration: 1.2,
            type: "spring",
            stiffness: 100,
            damping: 10,
          }}
          className="relative mb-8 mx-auto"
        >
          {/* Anillo exterior giratorio con efecto de pulso */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-500/30"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
              borderWidth: [2, 3, 2],
            }}
            transition={{
              rotate: {
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              borderWidth: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />

          {/* Anillo medio giratorio en dirección opuesta */}
          <motion.div
            className="absolute inset-4 rounded-full border border-secondary-500/40"
            animate={{
              rotate: -360,
              scale: [0.9, 1, 0.9],
            }}
            transition={{
              rotate: {
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />

          {/* Logo central con efectos mejorados */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 40px rgba(59, 130, 246, 0.5)",
                "0 0 20px rgba(59, 130, 246, 0.3)",
              ],
            }}
            transition={{
              rotate: {
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="w-32 h-32 rounded-full bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 flex items-center justify-center mx-auto relative overflow-hidden"
          >
            {/* Gradiente animado mejorado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600"
              animate={{
                background: [
                  "linear-gradient(0deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)",
                  "linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)",
                  "linear-gradient(360deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)",
                ],
                rotate: 360,
              }}
              transition={{
                background: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                },
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            />

            {/* Efecto de brillo interno pulsante */}
            <motion.div
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-4 rounded-full bg-white/30 blur-sm"
            />

            {/* Centro con efecto de pulso */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-8 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-xs"
            />

            {/* Logo personalizado */}
            <div className="w-20 h-20 relative z-10 flex items-center justify-center">
              <motion.img
                src="/icon.png"
                alt="Logo"
                className="w-full h-full object-contain"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: {
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                onError={(e) => {
                  console.error("Error cargando logo:", e);
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Efecto de chispas alrededor del logo */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-primary-300 to-secondary-300 rounded-full"
                  style={{
                    left: "50%",
                    top: "0%",
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    x: Math.cos((i * 30 * Math.PI) / 180) * 48,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 48,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    x: {
                      duration: 0.1,
                    },
                    y: {
                      duration: 0.1,
                    },
                    scale: {
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    },
                    opacity: {
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    },
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Partículas orbitales mejoradas */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                style={{
                  left: "50%",
                  top: "0%",
                  transform: "translate(-50%, -50%)",
                }}
                animate={{
                  x: Math.cos((i * 45 * Math.PI) / 180) * 70,
                  y: Math.sin((i * 45 * Math.PI) / 180) * 70,
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  x: {
                    duration: 0.1,
                  },
                  y: {
                    duration: 0.1,
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  },
                }}
              />
            ))}
          </motion.div>

          {/* Partículas radiales externas */}
          <div className="absolute inset-0">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                animate={{
                  x: Math.cos((i * 22.5 * Math.PI) / 180) * 90,
                  y: Math.sin((i * 22.5 * Math.PI) / 180) * 90,
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Texto principal */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={isVisible ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-bold mb-6 relative"
        >
          <motion.span
            className="bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-300 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            style={{
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            SST Services
          </motion.span>
        </motion.h1>

        {/* Mensaje de Bienvenido */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-8"
            >
              <motion.h2
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                ¡Bienvenido!
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Texto secundario */}
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={isVisible ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-300 mb-8 relative"
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 0px rgba(255,255,255,0)",
                "0 0 20px rgba(255,255,255,0.5)",
                "0 0 0px rgba(255,255,255,0)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Cargando sistema...
          </motion.span>
        </motion.p>

        {/* Barra de progreso mejorada */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          className="relative w-80 mx-auto"
        >
          {/* Fondo de la barra */}
          <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Barra de progreso animada */}
            <motion.div
              initial={{ width: 0 }}
              animate={isVisible ? { width: "100%" } : { width: 0 }}
              transition={{ delay: 1.8, duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 rounded-full relative"
            >
              {/* Efecto de brillo en la barra */}
              <motion.div
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>

          {/* Partículas que salen de la barra */}
          <AnimatePresence>
            {isVisible && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary-400 rounded-full"
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      opacity: 1,
                    }}
                    animate={{
                      x: Math.random() * 200 - 100,
                      y: Math.random() * -100 - 50,
                      scale: [0, 1, 0],
                      opacity: [1, 0.5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 2 + i * 0.2,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Indicador de porcentaje */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="mt-4 text-sm text-gray-400"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.7, type: "spring" }}
          >
            Iniciando experiencia...
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Efectos de borde de pantalla */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary-500 to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </motion.div>
  );
}
