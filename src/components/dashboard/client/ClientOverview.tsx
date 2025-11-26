"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Service {
  id: string;
  serviceType: string;
  status: string;
  description: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  suggestedDate: string;
  createdAt: string;
  completedAt: string | null;
  employee: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Stats {
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  total: number;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PENDING: {
      label: "Pendiente",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    },
    ASSIGNED: {
      label: "Asignado",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    },
    IN_PROGRESS: {
      label: "En Progreso",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    },
    COMPLETED: {
      label: "Completado",
      color: "bg-green-500/20 text-green-400 border-green-500/50",
    },
    CANCELLED: {
      label: "Cancelado",
      color: "bg-red-500/20 text-red-400 border-red-500/50",
    },
    POSTPONED: {
      label: "Aplazado",
      color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    },
    REOPENED: {
      label: "Reabierto",
      color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    },
  };
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
    >
      {config.label}
    </motion.span>
  );
};

const getServiceTypeName = (type: string): string => {
  const names: { [key: string]: string } = {
    PROFESIONAL_SST: "Profesional SST",
    TECNOLOGO_SST: "Tecnólogo SST",
    TECNICO_SST: "Técnico SST",
    COORDINADOR_ALTURAS: "Coordinador de Alturas",
    SUPERVISOR_ESPACIOS_CONFINADOS: "Supervisor Espacios Confinados",
    CAPACITACIONES_CURSOS: "Capacitaciones o Cursos",
    ALQUILER_EQUIPOS: "Alquiler de Equipos",
    ANDAMIERO: "Andamiero",
    AUDITORIA_SG_SST: "Auditoría SG-SST",
    RESCATISTA: "Rescatista",
    TAPH_PARAMEDICO: "TAPH (Paramédico)",
    AUXILIAR_OPERATIVO: "Auxiliar Operativo",
    SERVICIOS_ADMINISTRATIVOS: "Servicios Administrativos",
    NOMINA: "Nómina",
    FACTURACION: "Facturación",
    CONTRATOS: "Contratos",
    SEGURIDAD_SOCIAL: "Seguridad Social",
    OTRO: "Otro",
  };
  return names[type] || type;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ClientOverview() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar servicios");
      }

      setServices(data.services.slice(0, 4));
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-primary-500/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-500 rounded-full"></div>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <Card variant="cyber">
          <div className="text-center py-12">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <svg
                className="w-16 h-16 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-red-400 text-lg mb-4"
            >
              {error}
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary" onClick={fetchServices}>
                Reintentar
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-6"
    >
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            value: stats.pending,
            label: "Pendientes",
            gradient: "from-yellow-600 to-orange-600",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            value: stats.assigned,
            label: "Asignados",
            gradient: "from-blue-600 to-cyan-600",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
          },
          {
            value: stats.inProgress,
            label: "En Progreso",
            gradient: "from-purple-600 to-pink-600",
            icon: "M13 10V3L4 14h7v7l9-11h-7z",
          },
          {
            value: stats.completed,
            label: "Completados",
            gradient: "from-green-600 to-emerald-600",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              delay: index * 0.1,
              duration: 0.6,
              ease: "easeOut",
            }}
            whileHover={{ y: -8 }}
          >
            <Card variant="cyber" hover>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                  }}
                  className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient}`}
                >
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
                      d={stat.icon}
                    />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <motion.p
                    className="text-2xl font-bold text-white"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Botón de Nueva Solicitud */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="cyber">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={
                isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
              }
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-2">
                ¿Necesitas un servicio SST?
              </h3>
              <p className="text-gray-400">
                Solicita un servicio y nuestro equipo te asignará un profesional
                calificado
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/dashboard/client/new-request")}
                icon={
                  <motion.svg
                    animate={{ rotate: [0, 180, 0] }}
                    transition={{ duration: 0.5 }}
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </motion.svg>
                }
              >
                Nueva Solicitud
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Mis Solicitudes Recientes en Grid 2x2 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="cyber">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-white mb-6"
          >
            Mis Solicitudes Recientes
          </motion.h2>

          <AnimatePresence>
            {services.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-12"
              >
                <motion.svg
                  animate={{
                    y: [0, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-16 h-16 text-gray-500 mx-auto mb-4"
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
                </motion.svg>
                <p className="text-gray-400 mb-4">No tienes solicitudes aún</p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="primary"
                    onClick={() => router.push("/dashboard/client/new-request")}
                  >
                    Crear Primera Solicitud
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <>
                {/* Grid de 2 columnas para las solicitudes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={
                        isVisible
                          ? { opacity: 1, y: 0, scale: 1 }
                          : { opacity: 0, y: 30, scale: 0.95 }
                      }
                      transition={{
                        delay: 0.3 + index * 0.1,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whileHover={{
                        y: -6,
                        scale: 1.02,
                        transition: {
                          duration: 0.3,
                          ease: "easeInOut",
                        },
                      }}
                      className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 transition-all relative overflow-hidden group h-full flex flex-col"
                    >
                      {/* Efecto de brillo sutil al hacer hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 flex-1 flex flex-col">
                        {/* Header con título y estado */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <motion.h3
                              className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors line-clamp-2"
                              whileHover={{ x: 3 }}
                              transition={{ duration: 0.2 }}
                            >
                              {getServiceTypeName(service.serviceType)}
                            </motion.h3>
                            <p className="text-sm text-gray-400">
                              Solicitado el {formatDate(service.createdAt)}
                            </p>
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            {getStatusBadge(service.status)}
                          </div>
                        </div>

                        {/* Descripción */}
                        <motion.p
                          className="text-gray-300 mb-4 flex-1 line-clamp-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          {service.description}
                        </motion.p>

                        {/* Información detallada */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="line-clamp-1">
                              {service.address}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <svg
                              className="w-4 h-4 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>{formatDate(service.suggestedDate)}</span>
                          </div>

                          {service.employee && (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <svg
                                className="w-4 h-4 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span className="line-clamp-1">
                                Asignado a: {service.employee.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <motion.div
                          className="flex gap-2 pt-4 border-t border-gray-700 mt-auto"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.3 + index * 0.1 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1"
                          >
                            <Button variant="secondary" size="sm" fullWidth>
                              Ver detalles
                            </Button>
                          </motion.div>
                          {service.status === "COMPLETED" && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex-1"
                            >
                              <Button variant="primary" size="sm" fullWidth>
                                Descargar PDF
                              </Button>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {stats.total > 4 && (
                  <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="secondary"
                        onClick={() =>
                          router.push("/dashboard/client/requests")
                        }
                      >
                        Ver todas las solicitudes ({stats.total})
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
}
