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
  municipio: string;
  empresaContratante: string;
  fechaInicio: string;
  requiredDocs?: string[]; // Documentos configurados
  requiredInspections?: string[]; // Inspecciones configuradas
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

const STATUS_CONFIG = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  ASSIGNED: {
    label: "Asignado",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  IN_PROGRESS: {
    label: "En Progreso",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
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
  REOPENED: {
    label: "Reabierto",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
    icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  },
};

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

export default function ClientRequestsPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterAndSortServices();
  }, [services, searchTerm, statusFilter, sortBy]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar servicios");
      }

      setServices(data.services);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortServices = () => {
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
            .includes(searchTerm.toLowerCase()) ||
          service.municipio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== "ALL") {
      result = result.filter((service) => service.status === statusFilter);
    }

    // Ordenar
    if (sortBy === "date") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    setFilteredServices(result);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <Button variant="secondary" onClick={fetchServices}>
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Mis Solicitudes
          </h1>
          <p className="text-gray-400">
            Gestiona y revisa todas tus solicitudes de servicio
          </p>
        </div>
        <Button
          variant="primary"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total",
            value: stats.total,
            color: "from-gray-600 to-gray-700",
            active: statusFilter === "ALL",
            filter: "ALL",
          },
          {
            label: "Pendientes",
            value: stats.pending,
            color: "from-yellow-600 to-orange-600",
            active: statusFilter === "PENDING",
            filter: "PENDING",
          },
          {
            label: "Asignados",
            value: stats.assigned,
            color: "from-blue-600 to-cyan-600",
            active: statusFilter === "ASSIGNED",
            filter: "ASSIGNED",
          },
          {
            label: "En Progreso",
            value: stats.inProgress,
            color: "from-purple-600 to-pink-600",
            active: statusFilter === "IN_PROGRESS",
            filter: "IN_PROGRESS",
          },
          {
            label: "Completados",
            value: stats.completed,
            color: "from-green-600 to-emerald-600",
            active: statusFilter === "COMPLETED",
            filter: "COMPLETED",
          },
        ].map((stat) => (
          <motion.button
            key={stat.label}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter(stat.filter)}
            className={`p-4 rounded-xl bg-gray-800/50 border ${
              stat.active ? "border-primary-500" : "border-gray-700"
            } hover:border-primary-500/50 transition-all`}
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 mx-auto`}
            >
              <span className="text-white font-bold text-lg">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <Card variant="cyber">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por servicio, empresa o municipio..."
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

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "status")}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="date">Ordenar por fecha</option>
            <option value="status">Ordenar por estado</option>
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
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== "ALL"
                    ? "No se encontraron solicitudes con los filtros aplicados"
                    : "No tienes solicitudes aún"}
                </p>
                <Button
                  variant="primary"
                  onClick={() => router.push("/dashboard/client/new-request")}
                >
                  Crear Primera Solicitud
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => {
              const statusConfig =
                STATUS_CONFIG[service.status as keyof typeof STATUS_CONFIG] ||
                STATUS_CONFIG.PENDING;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-primary-500/50 transition-all cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/client/requests/${service.id}`)
                  }
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                        {SERVICE_TYPES[service.serviceType]}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatDate(service.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="line-clamp-1">
                        {service.empresaContratante}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 text-xs">
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
                      </svg>
                      <span>{service.municipio}</span>
                    </div>

                    {service.employee && (
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
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
                        <span className="line-clamp-1">
                          {service.employee.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <Button variant="secondary" size="sm" fullWidth>
                      Ver Detalles
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
