"use client";

import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center shadow-neon">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">SST Services</h2>
            <p className="text-xs text-gray-400">{getRoleName(user.role)}</p>
          </div>
        </motion.div>

        {/* User Menu */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <svg
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
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-secondary-500 rounded-full"></span>
          </button>

          {/* User Info */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors text-gray-400"
            title="Cerrar sesión"
          >
            <svg
              className="w-6 h-6"
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
            </svg>
          </button>
        </motion.div>
      </div>
    </header>
  );
}
