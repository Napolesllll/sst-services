"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Service {
  id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  client: {
    name: string;
  };
  employee: {
    name: string;
  } | null;
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
    month: "short",
    day: "numeric",
  });
};

export default function AdminOverview() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (response.ok) {
        setServices(data.services.slice(0, 3));
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Servicios Recientes */}
      <div className="lg:col-span-2">
        <Card variant="cyber">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Servicios Recientes
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/dashboard/admin/services")}
            >
              Ver todos
            </Button>
          </div>

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
              <p className="text-gray-400">No hay servicios registrados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {service.client.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {getServiceTypeName(service.serviceType)}
                      </p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
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
                      {formatDate(service.createdAt)}
                    </div>
                    {service.employee && (
                      <div className="flex items-center gap-2 text-gray-400">
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
                        {service.employee.name}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
                    <Button variant="secondary" size="sm" fullWidth>
                      Ver detalles
                    </Button>
                    {service.status === "PENDING" && (
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => router.push("/dashboard/admin/pending")}
                      >
                        Asignar
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="space-y-6">
        <Card variant="cyber">
          <h2 className="text-xl font-bold text-white mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push("/dashboard/admin/services")}
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
              Crear Servicio
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => router.push("/dashboard/admin/employees")}
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              }
            >
              Agregar Empleado
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => router.push("/dashboard/admin/reports")}
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
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            >
              Generar Reporte
            </Button>
          </div>
        </Card>

        {/* Alertas */}
        <Card variant="cyber">
          <h2 className="text-xl font-bold text-white mb-4">Alertas</h2>
          <div className="space-y-3">
            {stats.pending > 0 && (
              <button
                onClick={() => router.push("/dashboard/admin/pending")}
                className="w-full p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50 hover:bg-yellow-500/20 transition-colors text-left"
              >
                <p className="text-sm text-yellow-400 font-semibold">
                  {stats.pending}{" "}
                  {stats.pending === 1
                    ? "servicio pendiente"
                    : "servicios pendientes"}{" "}
                  de asignación
                </p>
              </button>
            )}
            {stats.inProgress > 0 && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/50">
                <p className="text-sm text-purple-400 font-semibold">
                  {stats.inProgress}{" "}
                  {stats.inProgress === 1 ? "servicio" : "servicios"} en
                  progreso
                </p>
              </div>
            )}
            {stats.pending === 0 && stats.inProgress === 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/50">
                <p className="text-sm text-green-400 font-semibold">
                  ✓ Todo al día
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
