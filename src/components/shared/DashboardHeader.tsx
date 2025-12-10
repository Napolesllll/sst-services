"use client";

import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image"; // 👈 IMPORTANTE para el logo

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const [isHoveringLogout, setIsHoveringLogout] = useState(false);
  const [showNotificationPulse, setShowNotificationPulse] = useState(true);
  const notificationRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMINISTRADOR":
        return "Administrador";
      case "EMPLEADO":
        return "Empleado";
      case "CLIENTE":
        return "Cliente";
      default:
        return role;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotificationPulse(true);
      setTimeout(() => setShowNotificationPulse(false), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(17, 24, 39, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        backgroundSize: "200% 200%",
      }}
    >
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
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
        }}
        className="absolute inset-0"
      />

      <motion.div
        className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
        animate={{
          opacity: [0.3, 1, 0.3],
          scaleX: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        {/* LOGO REAL */}
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          whileHover={{ scale: 1.05 }}
          onHoverStart={() => setIsHoveringLogo(true)}
          onHoverEnd={() => setIsHoveringLogo(false)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <motion.div
            animate={{
              boxShadow: isHoveringLogo
                ? [
                    "0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.6)",
                    "0 0 10px rgba(59, 130, 246, 0.3)",
                  ]
                : "0 0 0px rgba(59, 130, 246, 0)",
            }}
            transition={{ duration: 0.5 }}
            className="relative w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-black/20"
          >
            {/* TU LOGO — FUNCIONANDO  */}
            <Image
              src="/logo.png"
              alt="SST Services Logo"
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          <motion.div
            animate={{ x: isHoveringLogo ? [0, 5, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2
              animate={{
                textShadow: isHoveringLogo
                  ? [
                      "0 0 0px #fff",
                      "0 0 8px rgba(255,255,255,0.5)",
                      "0 0 0px #fff",
                    ]
                  : "0 0 0px #fff",
              }}
              transition={{
                duration: 1,
                repeat: isHoveringLogo ? Infinity : 0,
              }}
              className="text-lg font-bold text-white"
            >
              SST Services
            </motion.h2>
            <motion.p
              className="text-xs text-gray-400"
              animate={{ opacity: isHoveringLogo ? 1 : 0.7 }}
            >
              {getRoleName(user.role)}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* RESTO DEL HEADER (NO TOCADO) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
          className="flex items-center gap-4"
        >
          {/* Notificaciones */}
          <motion.button
            ref={notificationRef}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-lg hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
          >
            <motion.svg
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </motion.svg>

            <motion.span
              animate={{
                scale: showNotificationPulse ? [1, 1.5, 1] : 1,
                opacity: showNotificationPulse ? [1, 0, 1] : 1,
              }}
              transition={{ duration: 1 }}
              className="absolute top-1 right-1 w-2 h-2 bg-secondary-500 rounded-full"
            />

            <motion.span
              animate={{
                scale: showNotificationPulse ? [1, 2, 1] : 1,
                opacity: showNotificationPulse ? [0.5, 0, 0.5] : 0,
              }}
              transition={{ duration: 1.5 }}
              className="absolute top-1 right-1 w-2 h-2 border-2 border-secondary-500 rounded-full"
            />
          </motion.button>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 12 }}
            whileHover={{ scale: 1.1 }}
            className="hidden md:block text-right cursor-pointer"
          >
            <motion.p
              style={{
                background: "linear-gradient(90deg, #fff, #e5e7eb, #fff)",
                backgroundSize: "200% 100%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
              animate={{ backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="text-sm font-semibold"
            >
              {user.name}
            </motion.p>
            <motion.p
              className="text-xs text-gray-400"
              whileHover={{ color: "#d1d5db" }}
            >
              {user.email}
            </motion.p>
          </motion.div>

          {/* Logout */}
          <motion.button
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            onHoverStart={() => setIsHoveringLogout(true)}
            onHoverEnd={() => setIsHoveringLogout(false)}
            onClick={handleLogout}
            className="relative p-2 rounded-lg transition-colors group"
            style={{
              background: isHoveringLogout
                ? "linear-gradient(45deg, rgba(239,68,68,0.2), rgba(220,38,38,0.3))"
                : "transparent",
            }}
            title="Cerrar sesión"
          >
            {isHoveringLogout && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: i * 90 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.cos((i * 90 * Math.PI) / 180) * 20,
                      y: Math.sin((i * 90 * Math.PI) / 180) * 20,
                    }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="w-1 h-1 bg-red-400 rounded-full absolute"
                  />
                ))}
              </motion.div>
            )}

            <motion.svg
              animate={{ color: isHoveringLogout ? "#ef4444" : "#9ca3af" }}
              className="w-6 h-6 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </motion.svg>
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
}
