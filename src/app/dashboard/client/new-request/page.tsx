"use client";

import { motion, Variants } from "framer-motion";
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const floatingVariants: Variants = {
    floating: {
      y: [-8, 8, -8],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const gradientTextVariants: Variants = {
    floating: {
      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
      transition: {
        backgroundPosition: {
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        },
      },
    },
  };

  const particleVariants: Variants = {
    animate: (i: number) => ({
      x: [`${(i * 67) % 100}%`, `${(i * 67 + 40) % 100}%`],
      y: [`${(i * 23) % 100}%`, `${(i * 23 + 30) % 100}%`],
      scale: [0, 1, 0],
      opacity: [0, 0.7, 0],
      transition: {
        duration: 10 + i * 0.8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.3,
      },
    }),
  };

  const dotVariants: Variants = {
    animate: {
      scale: [1, 2, 1],
      opacity: [0.4, 0.8, 0.4],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const rotatingDotVariants: Variants = {
    animate: {
      scale: [1, 1.8, 1],
      opacity: [0.4, 0.7, 0.4],
      rotate: [0, 180, 360],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const backgroundOrbVariants: Variants = {
    animate: {
      scale: [1, 1.4, 1],
      opacity: [0.2, 0.5, 0.2],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const backgroundOrb2Variants: Variants = {
    animate: {
      scale: [1.2, 1, 1.2],
      opacity: [0.3, 0.1, 0.3],
      transition: {
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const glowVariants: Variants = {
    animate: {
      opacity: [0.05, 0.2, 0.05],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const formCardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  const textGlowVariants: Variants = {
    animate: {
      textShadow: [
        "0 0 0px rgba(255,255,255,0)",
        "0 0 15px rgba(255,255,255,0.4)",
        "0 0 0px rgba(255,255,255,0)",
      ],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const backgroundGradientVariants: Variants = {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      opacity: [0.6, 0.9, 0.6],
      transition: {
        backgroundPosition: {
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        },
        opacity: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
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
      {/* Efecto de partículas de fondo optimizado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary-500/30 rounded-full"
            custom={i}
            initial={{
              x: `${(i * 67) % 100}%`,
              y: `${(i * 23) % 100}%`,
              scale: 0,
            }}
            variants={particleVariants}
            animate="animate"
          />
        ))}
      </div>

      {/* Efecto de luz que sigue el cursor optimizado */}
      <motion.div
        className="absolute pointer-events-none w-80 h-80 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-3xl"
        animate={{
          x: mousePosition.x - 160,
          y: mousePosition.y - 160,
          scale: [1, 1.1, 1],
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 25,
          scale: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />

      {/* Header espectacular optimizado */}
      <motion.div
        variants={containerVariants}
        className="mb-8 text-center relative"
      >
        {/* Efecto de fondo animado para el header */}
        <motion.div
          variants={backgroundGradientVariants}
          initial="hidden"
          animate="animate"
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/15 via-secondary-500/15 to-cyan-500/15 bg-[length:200%_200%] blur-xl -z-10"
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
        >
          <motion.span variants={gradientTextVariants} animate="floating">
            Nueva Solicitud
          </motion.span>
        </motion.h1>

        <motion.div
          variants={lineVariants}
          initial="hidden"
          animate="visible"
          className="h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent mb-6 mx-auto w-64"
        />

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-400 mb-6 max-w-2xl mx-auto relative"
        >
          <motion.span variants={textGlowVariants} animate="animate">
            Completa el formulario y nuestro equipo asignará un profesional
            calificado
          </motion.span>
        </motion.p>

        {/* Elementos decorativos optimizados */}
        <motion.div
          className="absolute -top-2 -left-2 w-4 h-4 bg-primary-500 rounded-full opacity-40"
          variants={dotVariants}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-2 -right-2 w-3 h-3 bg-secondary-500 rounded-full opacity-40"
          variants={rotatingDotVariants}
          animate="animate"
        />
      </motion.div>

      {/* Contenedor del formulario con efectos optimizados */}
      <motion.div variants={itemVariants} className="relative">
        {/* Efecto de borde luminoso */}
        <motion.div
          variants={scaleInVariants}
          initial="hidden"
          animate="visible"
          className="absolute -inset-4 bg-gradient-to-r from-primary-500/25 via-secondary-500/20 to-cyan-500/25 rounded-3xl blur-lg -z-10"
        />

        {/* Efecto de brillo interno */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-cyan-500/10 pointer-events-none"
          variants={glowVariants}
          animate="animate"
        />

        {/* Tarjeta principal del formulario optimizada */}
        <motion.div
          variants={formCardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          className="relative bg-gray-900/90 backdrop-blur-2xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden"
        >
          {/* Patrón de fondo sutil optimizado */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25px 25px, rgba(120, 119, 198, 0.3) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
                backgroundSize: "100px 100px",
              }}
            />
          </div>

          {/* Efecto de partículas internas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 bg-cyan-400/30 rounded-full"
                initial={{
                  x: `${(i * 33) % 100}%`,
                  y: `${(i * 17) % 100}%`,
                  scale: 0,
                }}
                animate={{
                  x: [`${(i * 33) % 100}%`, `${(i * 33 + 20) % 100}%`],
                  y: [`${(i * 17) % 100}%`, `${(i * 17 + 15) % 100}%`],
                  scale: [0, 1, 0],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 6 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.8,
                }}
              />
            ))}
          </div>

          {/* Contenido del formulario */}
          <div className="relative z-10 p-1">
            <ServiceRequestForm />
          </div>
        </motion.div>
      </motion.div>

      {/* Efectos de partículas laterales optimizadas */}
      <motion.div
        className="absolute left-0 top-1/3 w-48 h-48 bg-primary-500/15 rounded-full blur-2xl -z-10"
        variants={backgroundOrbVariants}
        animate="animate"
      />
      <motion.div
        className="absolute right-0 bottom-1/4 w-56 h-56 bg-secondary-500/15 rounded-full blur-2xl -z-10"
        variants={backgroundOrb2Variants}
        animate="animate"
      />

      {/* Línea decorativa inferior optimizada */}
      <motion.div
        variants={lineVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.5 }}
        className="h-px bg-gradient-to-r from-transparent via-primary-500/60 to-transparent mt-12 mx-auto w-3/4"
      />

      {/* Elementos decorativos adicionales */}
      <motion.div
        className="absolute top-1/4 left-10 w-2 h-2 bg-cyan-400/50 rounded-full"
        animate={{
          scale: [0, 1.5, 0],
          opacity: [0, 0.8, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-10 w-1 h-1 bg-purple-400/60 rounded-full"
        animate={{
          scale: [0, 2, 0],
          opacity: [0, 0.6, 0],
          x: [0, -15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />
    </motion.div>
  );
}
