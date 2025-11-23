"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Mock data - reemplazar con datos reales
const assignedServices = [
  {
    id: "1",
    client: "Constructora ABC",
    type: "Coordinador de Alturas",
    status: "ASSIGNED",
    address: "Calle 123 #45-67, Medellín",
    contactPerson: "Carlos Ramírez",
    contactPhone: "+57 300 123 4567",
    suggestedDate: "2024-01-18 08:00",
    description:
      "Supervisión de trabajo en alturas para instalación de estructura metálica",
  },
  {
    id: "2",
    client: "Empresa XYZ",
    type: "Profesional SST",
    status: "IN_PROGRESS",
    address: "Carrera 50 #32-10, Medellín",
    contactPerson: "Ana Morales",
    contactPhone: "+57 301 987 6543",
    suggestedDate: "2024-01-17 14:00",
    description: "Auditoría y seguimiento de programa de seguridad industrial",
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    ASSIGNED: {
      label: "Asignado",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    },
    IN_PROGRESS: {
      label: "En Progreso",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    },
  };
  const config = statusConfig[status as keyof typeof statusConfig];
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
    >
      {config.label}
    </span>
  );
};

export default function EmployeeOverview() {
  return (
    <div className="space-y-6">
      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-2xl font-bold text-white">3</p>
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">En Progreso</p>
              <p className="text-2xl font-bold text-white">1</p>
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
              <p className="text-2xl font-bold text-white">24</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Servicios Asignados */}
      <Card variant="cyber">
        <h2 className="text-2xl font-bold text-white mb-6">
          Mis Servicios Activos
        </h2>

        <div className="space-y-4">
          {assignedServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {service.client}
                  </h3>
                  <p className="text-secondary-400 font-medium">
                    {service.type}
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
                  {service.suggestedDate}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {service.contactPerson}
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {service.contactPhone}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-700">
                {service.status === "ASSIGNED" && (
                  <Button variant="primary" fullWidth>
                    Iniciar Servicio
                  </Button>
                )}
                {service.status === "IN_PROGRESS" && (
                  <>
                    <Button variant="secondary" fullWidth>
                      Continuar
                    </Button>
                    <Button variant="primary" fullWidth>
                      Finalizar
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
