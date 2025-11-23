"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
    >
      {config.label}
    </span>
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

  useEffect(() => {
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

      setServices(data.services.slice(0, 3)); // Mostrar solo los últimos 3
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="cyber">
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 text-red-400 mx-auto mb-4"
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
          <p className="text-red-400">{error}</p>
          <Button variant="secondary" className="mt-4" onClick={fetchServices}>
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="cyber" hover>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card variant="cyber" hover>
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
              <p className="text-gray-400 text-sm">Asignados</p>
              <p className="text-2xl font-bold text-white">{stats.assigned}</p>
            </div>
          </div>
        </Card>

        <Card variant="cyber" hover>
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
                {stats.inProgress}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="cyber" hover>
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
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Botón de Nueva Solicitud */}
      <Card variant="cyber">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Necesitas un servicio SST?
            </h3>
            <p className="text-gray-400">
              Solicita un servicio y nuestro equipo te asignará un profesional
              calificado
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/dashboard/client/new-request")}
            icon={
              <svg
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
              </svg>
            }
          >
            Nueva Solicitud
          </Button>
        </div>
      </Card>

      {/* Mis Solicitudes */}
      <Card variant="cyber">
        <h2 className="text-2xl font-bold text-white mb-6">
          Mis Solicitudes Recientes
        </h2>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <svg
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
            </svg>
            <p className="text-gray-400 mb-4">No tienes solicitudes aún</p>
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/client/new-request")}
            >
              Crear Primera Solicitud
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {getServiceTypeName(service.serviceType)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Solicitado el {formatDate(service.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>

                  <p className="text-gray-300 mb-4">{service.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg
                        className="w-4 h-4"
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
                      {service.address}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg
                        className="w-4 h-4"
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
                      {formatDate(service.suggestedDate)}
                    </div>
                    {service.employee && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <svg
                          className="w-4 h-4"
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
                        Asignado a: {service.employee.name}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <Button variant="secondary" size="sm" fullWidth>
                      Ver detalles
                    </Button>
                    {service.status === "COMPLETED" && (
                      <Button variant="primary" size="sm" fullWidth>
                        Descargar PDF
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {stats.total > 3 && (
              <div className="mt-6 text-center">
                <Button
                  variant="secondary"
                  onClick={() => router.push("/dashboard/client/requests")}
                >
                  Ver todas las solicitudes ({stats.total})
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
