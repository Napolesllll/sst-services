"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Mock data - reemplazar con datos reales de la base de datos
const recentServices = [
  {
    id: "1",
    client: "Constructora ABC",
    type: "Coordinador de Alturas",
    status: "PENDING",
    date: "2024-01-15",
  },
  {
    id: "2",
    client: "Empresa XYZ",
    type: "Auditoría SG-SST",
    status: "ASSIGNED",
    employee: "Juan Pérez",
    date: "2024-01-14",
  },
  {
    id: "3",
    client: "Servicios Generales S.A.",
    type: "Profesional SST",
    status: "IN_PROGRESS",
    employee: "María García",
    date: "2024-01-13",
  },
];

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

export default function AdminOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Servicios Recientes */}
      <div className="lg:col-span-2">
        <Card variant="cyber">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Servicios Recientes
            </h2>
            <Button variant="secondary" size="sm">
              Ver todos
            </Button>
          </div>

          <div className="space-y-4">
            {recentServices.map((service, index) => (
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
                      {service.client}
                    </h3>
                    <p className="text-sm text-gray-400">{service.type}</p>
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
                    {service.date}
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
                      {service.employee}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700 flex gap-2">
                  <Button variant="secondary" size="sm" fullWidth>
                    Ver detalles
                  </Button>
                  {service.status === "PENDING" && (
                    <Button variant="primary" size="sm" fullWidth>
                      Asignar
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
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
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/50">
              <p className="text-sm text-yellow-400 font-semibold">
                5 servicios pendientes de asignación
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/50">
              <p className="text-sm text-blue-400 font-semibold">
                3 documentos por revisar
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
