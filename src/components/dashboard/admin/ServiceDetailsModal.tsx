"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

interface ServiceDetails {
  id: string;
  serviceType: string;
  status: string;
  description: string;
  address: string | null;
  contactPerson: string;
  contactPhone: string;
  suggestedDate: string | null;
  startDate: string | null;
  endDate: string | null;
  observations: string | null;
  empresaContratante: string;
  personaSolicita: string;
  cantidadRequerida: number;
  equiposUtilizar: string;
  herramientasUtilizar: string;
  maquinasUtilizar: string;
  numeroTrabajadores: number;
  municipio: string;
  empresaPrestacionServicio: string;
  fechaInicio: string;
  fechaTerminacion: string;
  horarioEjecucion: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  employee: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  documents: any[];
  inspections: any[];
  evidences: any[];
}

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
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

const formatDate = (dateString: string | null) => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (dateString: string | null) => {
  if (!dateString) return "No especificada";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ServiceDetailsModal({
  isOpen,
  onClose,
  serviceId,
}: ServiceDetailsModalProps) {
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchServiceDetails();
    }
  }, [isOpen, serviceId]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/services/${serviceId}`);
      const data = await response.json();

      if (response.ok) {
        setService(data.service);
      } else {
        setError(data.error || "Error al cargar el servicio");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching service details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-gray-900 rounded-xl border border-primary-500/30 shadow-2xl shadow-primary-500/20 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white">
                  Detalles del Servicio
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
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
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button variant="secondary" onClick={fetchServiceDetails}>
                      Reintentar
                    </Button>
                  </div>
                ) : service ? (
                  <div className="space-y-6">
                    {/* Estado y Tipo */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {getServiceTypeName(service.serviceType)}
                        </h3>
                        <p className="text-sm text-gray-400">
                          ID: {service.id}
                        </p>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>

                    {/* Información del Cliente */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-primary-400"
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
                        Información del Cliente
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Nombre</p>
                          <p className="text-white">{service.client.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Email</p>
                          <p className="text-white">{service.client.email}</p>
                        </div>
                        {service.client.phone && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Teléfono
                            </p>
                            <p className="text-white">{service.client.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Información del Empleado Asignado */}
                    {service.employee && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Empleado Asignado
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Nombre</p>
                            <p className="text-white">
                              {service.employee.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Email</p>
                            <p className="text-white">
                              {service.employee.email}
                            </p>
                          </div>
                          {service.employee.phone && (
                            <div>
                              <p className="text-xs text-gray-400 mb-1">
                                Teléfono
                              </p>
                              <p className="text-white">
                                {service.employee.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Detalles del Servicio */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-green-400"
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
                        Detalles del Servicio
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Descripción
                          </p>
                          <p className="text-white">{service.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Persona de Contacto
                            </p>
                            <p className="text-white">
                              {service.contactPerson}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Teléfono de Contacto
                            </p>
                            <p className="text-white">{service.contactPhone}</p>
                          </div>
                          {service.address && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-400 mb-1">
                                Dirección
                              </p>
                              <p className="text-white">{service.address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Información Empresarial */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-purple-400"
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
                        Información Empresarial
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Empresa Contratante
                          </p>
                          <p className="text-white">
                            {service.empresaContratante}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Persona que Solicita
                          </p>
                          <p className="text-white">
                            {service.personaSolicita}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Empresa de Prestación
                          </p>
                          <p className="text-white">
                            {service.empresaPrestacionServicio}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Municipio
                          </p>
                          <p className="text-white">{service.municipio}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recursos y Personal */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        Recursos y Personal
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Cantidad Requerida
                          </p>
                          <p className="text-white">
                            {service.cantidadRequerida}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Número de Trabajadores
                          </p>
                          <p className="text-white">
                            {service.numeroTrabajadores}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-400 mb-1">
                            Equipos a Utilizar
                          </p>
                          <p className="text-white">
                            {service.equiposUtilizar}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-400 mb-1">
                            Herramientas a Utilizar
                          </p>
                          <p className="text-white">
                            {service.herramientasUtilizar}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-400 mb-1">
                            Máquinas a Utilizar
                          </p>
                          <p className="text-white">
                            {service.maquinasUtilizar}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fechas y Horarios */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-cyan-400"
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
                        Fechas y Horarios
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Fecha de Inicio
                          </p>
                          <p className="text-white">
                            {formatDateShort(service.fechaInicio)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Fecha de Terminación
                          </p>
                          <p className="text-white">
                            {formatDateShort(service.fechaTerminacion)}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-400 mb-1">
                            Horario de Ejecución
                          </p>
                          <p className="text-white">
                            {service.horarioEjecucion}
                          </p>
                        </div>
                        {service.suggestedDate && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Fecha Sugerida
                            </p>
                            <p className="text-white">
                              {formatDateShort(service.suggestedDate)}
                            </p>
                          </div>
                        )}
                        {service.startDate && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Fecha Real de Inicio
                            </p>
                            <p className="text-white">
                              {formatDateShort(service.startDate)}
                            </p>
                          </div>
                        )}
                        {service.endDate && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Fecha Real de Fin
                            </p>
                            <p className="text-white">
                              {formatDateShort(service.endDate)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Observaciones */}
                    {service.observations && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <h4 className="text-md font-semibold text-white mb-3">
                          Observaciones
                        </h4>
                        <p className="text-gray-300">{service.observations}</p>
                      </div>
                    )}

                    {/* Documentos, Inspecciones y Evidencias */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
                        <svg
                          className="w-8 h-8 text-primary-400 mx-auto mb-2"
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
                        <p className="text-2xl font-bold text-white">
                          {service.documents.length}
                        </p>
                        <p className="text-sm text-gray-400">Documentos</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
                        <svg
                          className="w-8 h-8 text-blue-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        <p className="text-2xl font-bold text-white">
                          {service.inspections.length}
                        </p>
                        <p className="text-sm text-gray-400">Inspecciones</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 text-center">
                        <svg
                          className="w-8 h-8 text-green-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-2xl font-bold text-white">
                          {service.evidences.length}
                        </p>
                        <p className="text-sm text-gray-400">Evidencias</p>
                      </div>
                    </div>

                    {/* Metadatos */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <h4 className="text-md font-semibold text-white mb-3">
                        Información del Sistema
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Creado por
                          </p>
                          <p className="text-white">{service.createdBy.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Fecha de creación
                          </p>
                          <p className="text-white">
                            {formatDate(service.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Última actualización
                          </p>
                          <p className="text-white">
                            {formatDate(service.updatedAt)}
                          </p>
                        </div>
                        {service.completedAt && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">
                              Completado el
                            </p>
                            <p className="text-white">
                              {formatDate(service.completedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
                <Button variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
