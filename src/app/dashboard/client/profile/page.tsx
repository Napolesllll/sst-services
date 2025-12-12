"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface Stats {
  totalServices: number;
  completedServices: number;
  inProgressServices: number;
  totalDocuments: number;
}

export default function ClientProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalServices: 0,
    completedServices: 0,
    inProgressServices: 0,
    totalDocuments: 0,
  });

  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || "",
      });
    }
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (response.ok) {
        const totalDocs = data.services.reduce(
          (acc: number, service: any) => acc + (service.documents?.length || 0),
          0
        );

        setStats({
          totalServices: data.stats.total,
          completedServices: data.stats.completed,
          inProgressServices: data.stats.inProgress,
          totalDocuments: totalDocs,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil");
      }

      await update();
      setSuccess("Perfil actualizado exitosamente");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar contraseña");
      }

      setSuccess("Contraseña actualizada exitosamente");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setChangingPassword(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">Mi Perfil</h1>
        <p className="text-gray-400">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -4 }}>
          <Card variant="cyber">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
                <svg
                  className="w-8 h-8 text-white"
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
                <p className="text-gray-400 text-sm">Servicios</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalServices}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card variant="cyber">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600">
                <svg
                  className="w-8 h-8 text-white"
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
                  {stats.completedServices}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card variant="cyber">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                <svg
                  className="w-8 h-8 text-white"
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
                  {stats.inProgressServices}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card variant="cyber">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Documentos</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalDocuments}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card variant="cyber">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Información Personal
                </h2>
                {!isEditing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-400"
                >
                  {success}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El correo electrónico no puede ser modificado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setError("");
                        if (session?.user) {
                          setFormData({
                            name: session.user.name || "",
                            email: session.user.email || "",
                            phone: (session.user as any).phone || "",
                          });
                        }
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </Card>

          {/* Change Password */}
          <Card variant="cyber" className="mt-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Cambiar Contraseña
                </h2>
                {!changingPassword && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setChangingPassword(true)}
                  >
                    Cambiar
                  </Button>
                )}
              </div>

              {changingPassword && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setChangingPassword(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setError("");
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                  </div>
                </form>
              )}

              {!changingPassword && (
                <p className="text-gray-400 text-sm">
                  Por seguridad, te recomendamos cambiar tu contraseña
                  periódicamente
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Account Info */}
        <div>
          <Card variant="cyber">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Información de la Cuenta
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Rol</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/50">
                      Cliente
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Estado</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                      Activo
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Miembro desde</p>
                  <p className="text-white">
                    {session?.user
                      ? new Date(
                          (session.user as any).createdAt || Date.now()
                        ).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm text-gray-300">
                    Descargar mis datos
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm text-gray-300">
                    Notificaciones
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm text-red-400">
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
