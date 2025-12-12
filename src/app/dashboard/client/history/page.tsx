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
  completedAt: string | null;
  createdAt: string;
  empresaContratante: string;
  municipio: string;
  employee: {
    id: string;
    name: string;
  } | null;
}

const SERVICE_TYPES: { [key: string]: string } = {
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

export default function ClientHistoryPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<
    "all" | "month" | "quarter" | "year"
  >("all");

  useEffect(() => {
    fetchHistoryServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, dateFilter]);

  const fetchHistoryServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar servicios");
      }

      // Filtrar solo servicios completados, cancelados o cerrados
      const completed = data.services.filter(
        (s: Service) =>
          s.status === "COMPLETED" ||
          s.status === "CANCELLED" ||
          s.status === "POSTPONED"
      );
      setServices(completed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let result = [...services];

    // Filtrar por búsqueda
    if (searchTerm) {
      result = result.filter(
        (service) =>
          SERVICE_TYPES[service.serviceType]
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.empresaContratante
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por fecha
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateFilter === "quarter") {
        filterDate.setMonth(now.getMonth() - 3);
      } else if (dateFilter === "year") {
        filterDate.setFullYear(now.getFullYear() - 1);
      }

      result = result.filter((service) => {
        const completedDate = service.completedAt
          ? new Date(service.completedAt)
          : new Date(service.createdAt);
        return completedDate >= filterDate;
      });
    }

    // Ordenar por fecha de finalización (más recientes primero)
    result.sort((a, b) => {
      const dateA = a.completedAt
        ? new Date(a.completedAt).getTime()
        : new Date(a.createdAt).getTime();
      const dateB = b.completedAt
        ? new Date(b.completedAt).getTime()
        : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    setFilteredServices(result);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    const config = {
      COMPLETED: {
        label: "Completado",
        color: "bg-green-500/20 text-green-400 border-green-500/50",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      },
      CANCELLED: {
        label: "Cancelado",
        color: "bg-red-500/20 text-red-400 border-red-500/50",
        icon: "M6 18L18 6M6 6l12 12",
      },
      POSTPONED: {
        label: "Aplazado",
        color: "bg-orange-500/20 text-orange-400 border-orange-500/50",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      },
    };
    return config[status as keyof typeof config] || config.COMPLETED;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="cyber">
        <div className="text-center py-12">
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
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="secondary" onClick={fetchHistoryServices}>
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  const completedCount = services.filter(
    (s) => s.status === "COMPLETED"
  ).length;
  const cancelledCount = services.filter(
    (s) => s.status === "CANCELLED"
  ).length;
  const postponedCount = services.filter(
    (s) => s.status === "POSTPONED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Historial de Servicios
        </h1>
        <p className="text-gray-400">
          Revisa todos tus servicios finalizados y su estado
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="cyber">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700">
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
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{services.length}</p>
            </div>
          </div>
        </Card>

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
              <p className="text-2xl font-bold text-white">{completedCount}</p>
            </div>
          </div>
        </Card>

        <Card variant="cyber">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-600 to-rose-600">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Cancelados</p>
              <p className="text-2xl font-bold text-white">{cancelledCount}</p>
            </div>
          </div>
        </Card>

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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Aplazados</p>
              <p className="text-2xl font-bold text-white">{postponedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="cyber">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en historial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value as "all" | "month" | "quarter" | "year"
              )
            }
            className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">Todos los tiempos</option>
            <option value="month">Último mes</option>
            <option value="quarter">Últimos 3 meses</option>
            <option value="year">Último año</option>
          </select>
        </div>
      </Card>

      {/* Services List */}
      <AnimatePresence>
        {filteredServices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="cyber">
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
                <p className="text-gray-400 mb-2">
                  {searchTerm || dateFilter !== "all"
                    ? "No se encontraron servicios con los filtros aplicados"
                    : "Aún no tienes servicios finalizados"}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Cuando completes servicios, aparecerán aquí
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service, index) => {
              const statusConfig = getStatusConfig(service.status);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="cyber" hover>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`p-3 rounded-lg ${
                            statusConfig.color.split(" ")[0]
                          }`}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              statusConfig.color.split(" ")[1]
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={statusConfig.icon}
                            />
                          </svg>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {SERVICE_TYPES[service.serviceType]}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {service.empresaContratante} •{" "}
                                {service.municipio}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>

                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {service.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center gap-1">
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
                              <span>
                                Finalizado:{" "}
                                {formatDate(
                                  service.completedAt || service.createdAt
                                )}
                              </span>
                            </div>

                            {service.employee && (
                              <div className="flex items-center gap-1">
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
                                <span>{service.employee.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/client/requests/${service.id}`
                              )
                            }
                          >
                            Ver Detalles
                          </Button>
                          {service.status === "COMPLETED" && (
                            <Button variant="primary" size="sm">
                              Descargar PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
