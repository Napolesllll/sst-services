"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AssignEmployeeModal from "./AssignEmployeeModal";
import ServiceConfigurationModal from "./ServiceConfigurationModal";

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
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

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

export default function PendingServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [suggestedDocs, setSuggestedDocs] = useState<string[]>([]);
  const [suggestedInspections, setSuggestedInspections] = useState<string[]>(
    []
  );

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const fetchPendingServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services?status=PENDING");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar servicios");
      }

      setServices(data.services);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedConfiguration = async (serviceType: string) => {
    try {
      const response = await fetch("/api/configuration/service-types");
      const data = await response.json();

      if (response.ok && data.configurations) {
        const config = data.configurations.find(
          (c: any) => c.serviceType === serviceType && c.active
        );

        if (config) {
          setSuggestedDocs(config.requiredDocs || []);
          setSuggestedInspections(config.requiredInspections || []);
        } else {
          setSuggestedDocs([]);
          setSuggestedInspections([]);
        }
      }
    } catch (err) {
      console.error("Error fetching suggested configuration:", err);
      setSuggestedDocs([]);
      setSuggestedInspections([]);
    }
  };

  const handleAssignClick = (service: Service) => {
    setSelectedService(service);
    setShowAssignModal(true);
  };

  const handleConfigClick = (service: Service) => {
    setSelectedService(service);
    fetchSuggestedConfiguration(service.serviceType);
    setShowConfigModal(true);
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    setSelectedService(null);
    fetchPendingServices(); // Recargar la lista
  };

  const handleConfigSuccess = () => {
    setShowConfigModal(false);
    setSelectedService(null);
    fetchPendingServices(); // Recargar la lista
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
          <Button
            variant="secondary"
            className="mt-4"
            onClick={fetchPendingServices}
          >
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  if (services.length === 0) {
    return (
      <Card variant="cyber">
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 mb-6 shadow-neon">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">¡Todo al día!</h3>
          <p className="text-gray-400">
            No hay solicitudes pendientes por asignar
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card variant="cyber">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {services.length}{" "}
            {services.length === 1
              ? "Solicitud Pendiente"
              : "Solicitudes Pendientes"}
          </h2>
          <div className="flex items-center gap-2 text-yellow-400">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">Requiere asignación</span>
          </div>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-lg bg-gray-800/50 border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      {getServiceTypeName(service.serviceType)}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                      PENDIENTE
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Solicitado el {formatDate(service.createdAt)}
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleAssignClick(service)}
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
                  Asignar Empleado
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleConfigClick(service)}
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                >
                  Configurar
                </Button>
              </div>

              {/* Descripción */}
              <div className="mb-4 p-4 rounded-lg bg-gray-900/50">
                <p className="text-gray-300">{service.description}</p>
              </div>

              {/* Información del Cliente */}
              <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
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
                  Información del Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="text-sm text-white font-medium">
                      {service.client.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-white font-medium">
                      {service.client.email}
                    </p>
                  </div>
                  {service.client.phone && (
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-sm text-white font-medium">
                        {service.client.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detalles del Servicio */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dirección</p>
                    <p className="text-sm text-white">{service.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary-500/20 text-secondary-400">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha Sugerida</p>
                    <p className="text-sm text-white">
                      {formatDate(service.suggestedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contacto</p>
                    <p className="text-sm text-white">
                      {service.contactPerson}
                    </p>
                    <p className="text-xs text-gray-400">
                      {service.contactPhone}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Modal de Asignación */}
      {showAssignModal && selectedService && (
        <AssignEmployeeModal
          service={selectedService}
          onClose={() => setShowAssignModal(false)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* Modal de Configuración */}
      {showConfigModal && selectedService && (
        <ServiceConfigurationModal
          serviceId={selectedService.id}
          serviceName={`${getServiceTypeName(selectedService.serviceType)} - ${
            selectedService.client.name
          }`}
          serviceType={selectedService.serviceType}
          suggestedDocs={suggestedDocs}
          suggestedInspections={suggestedInspections}
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSuccess={handleConfigSuccess}
        />
      )}
    </>
  );
}
