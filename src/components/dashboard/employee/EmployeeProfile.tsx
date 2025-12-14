"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
}

interface Stats {
  assigned: number;
  inProgress: number;
  completed: number;
  total: number;
}

export default function EmployeeProfile({
  user,
  stats,
}: {
  user: User;
  stats: Stats;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar");
      }

      setSuccess("Perfil actualizado exitosamente");
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-3xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              {user.phone && (
                <p className="text-gray-500 text-sm">📞 {user.phone}</p>
              )}
            </div>
          </div>
          <Button
            variant={isEditing ? "secondary" : "primary"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancelar" : "Editar Perfil"}
          </Button>
        </div>

        {isEditing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmit}
            className="space-y-4 border-t border-gray-700 pt-6"
          >
            <Input
              type="text"
              label="Nombre Completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              type="tel"
              label="Teléfono"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+57 300 123 4567"
            />

            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-400">
                {success}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Guardar Cambios
            </Button>
          </motion.form>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
          <div>
            <p className="text-sm text-gray-400 mb-1">Rol</p>
            <p className="text-white font-semibold">Empleado</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Estado</p>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/50">
              {user.active ? "✅ Activo" : "❌ Inactivo"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Miembro desde</p>
            <p className="text-white font-semibold">
              {new Date(user.createdAt).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-bold text-white mb-4">
          Estadísticas de Servicios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-gray-900/50 border border-blue-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-900/20 to-gray-900/50 border border-yellow-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <svg
                  className="w-6 h-6 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Asignados</p>
                <p className="text-2xl font-bold text-white">
                  {stats.assigned}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-purple-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">En Progreso</p>
                <p className="text-2xl font-bold text-white">
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-gray-900/50 border border-green-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completados</p>
                <p className="text-2xl font-bold text-white">
                  {stats.completed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
