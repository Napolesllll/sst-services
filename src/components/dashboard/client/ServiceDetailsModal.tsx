"use client";

import { motion, AnimatePresence } from "framer-motion";

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
  empresaPrestacionServicio: string;
  municipio?: string;
  empresaContratante?: string;
  fechaInicio?: string;
  employee: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface ServiceDetailsModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig: { [key: string]: { label: string; color: string } } = {
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
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${config.color}`}>
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

export default function ServiceDetailsModal({
  service,
  isOpen,
  onClose,
}: ServiceDetailsModalProps) {
  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 sticky top-0 z-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-3xl font-bold text-white mb-2"
                    >
                      {getServiceTypeName(service.serviceType)}
                    </motion.h2>
                    <p className="text-primary-100 text-lg">
                      {service.empresaPrestacionServicio}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Estado y detalles rápidos */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Estado</p>
                    {getStatusBadge(service.status)}
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Solicitado</p>
                    <p className="text-white font-semibold">
                      {formatDate(service.createdAt)}
                    </p>
                  </div>
                </motion.div>

                {/* Descripción */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Descripción
                  </h3>
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <p className="text-gray-300 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>

                {/* Información de contacto */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Información de Contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-primary-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-gray-400 text-sm">Persona Contacto</p>
                        <p className="text-white font-semibold">
                          {service.contactPerson}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-primary-400 flex-shrink-0"
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
                      <div>
                        <p className="text-gray-400 text-sm">Teléfono</p>
                        <p className="text-white font-semibold">
                          {service.contactPhone}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Ubicación y fecha */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Detalles de Servicio
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1"
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
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Dirección</p>
                        <p className="text-white font-semibold">
                          {service.address}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-primary-400 flex-shrink-0"
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
                      <div>
                        <p className="text-gray-400 text-sm">Fecha Sugerida</p>
                        <p className="text-white font-semibold">
                          {formatDate(service.suggestedDate)}
                        </p>
                      </div>
                    </div>
                    {service.municipio && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center gap-3">
                        <svg
                          className="w-5 h-5 text-primary-400 flex-shrink-0"
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
                        <div>
                          <p className="text-gray-400 text-sm">Municipio</p>
                          <p className="text-white font-semibold">
                            {service.municipio}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Empleado asignado */}
                {service.employee && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Profesional Asignado
                    </h3>
                    <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg p-4 border border-primary-500/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {service.employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">
                            {service.employee.name}
                          </p>
                          <p className="text-primary-300 text-sm">
                            {service.employee.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Botón cerrar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4"
                >
                  <button
                    onClick={onClose}
                    className="w-full py-3 px-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Cerrar Detalles
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
