"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ServiceDocuments from "./ServiceDocuments";
import ServiceInspections from "./ServiceInspections";
import ServiceEvidence from "./ServiceEvidence";

interface Service {
  id: string;
  serviceType: string;
  status: string;
  description: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  suggestedDate: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  documents: any[];
  inspections: any[];
  evidences: any[];
}

interface ServiceExecutionProps {
  service: Service;
  userId: string;
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
    COMPLETED: {
      label: "Completado",
      color: "bg-green-500/20 text-green-400 border-green-500/50",
    },
  };
  const config = statusConfig[status as keyof typeof statusConfig];
  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold border ${config.color}`}
    >
      {config.label}
    </span>
  );
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

export default function ServiceExecution({
  service,
  userId,
}: ServiceExecutionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "info" | "documents" | "inspections" | "evidence"
  >("info");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartService = async () => {
    if (!confirm("¿Estás seguro de iniciar este servicio?")) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar servicio");
      }

      // Recargar la página para actualizar el estado
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteService = async () => {
    if (
      !confirm(
        "¿Estás seguro de finalizar este servicio? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/services/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al completar servicio");
      }

      // Redirigir al dashboard
      router.push("/dashboard/employee");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "info", label: "Información", icon: "📋" },
    {
      id: "documents",
      label: "Documentos",
      icon: "📄",
      badge: service.documents.length,
    },
    {
      id: "inspections",
      label: "Inspecciones",
      icon: "✓",
      badge: service.inspections.length,
    },
    {
      id: "evidence",
      label: "Evidencias",
      icon: "📸",
      badge: service.evidences.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="cyber">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-white">
                {getServiceTypeName(service.serviceType)}
              </h1>
              {getStatusBadge(service.status)}
            </div>
            <p className="text-gray-400 ml-12">
              Cliente: {service.client.name}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            {service.status === "ASSIGNED" && (
              <Button
                variant="primary"
                onClick={handleStartService}
                loading={loading}
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                Iniciar Servicio
              </Button>
            )}
            {service.status === "IN_PROGRESS" && (
              <Button
                variant="primary"
                onClick={handleCompleteService}
                loading={loading}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                Finalizar Servicio
              </Button>
            )}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400"
          >
            {error}
          </motion.div>
        )}
      </Card>

      {/* Tabs */}
      <Card variant="cyber">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-neon"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-white text-primary-600"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Descripción del Servicio
              </h3>
              <p className="text-gray-300 bg-gray-800/50 p-4 rounded-lg">
                {service.description}
              </p>
            </div>

            {/* Información del Cliente */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Nombre</p>
                  <p className="text-white font-medium">
                    {service.client.name}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white font-medium">
                    {service.client.email}
                  </p>
                </div>
                {service.client.phone && (
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Teléfono</p>
                    <p className="text-white font-medium">
                      {service.client.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles del Servicio */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Detalles del Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Dirección</p>
                  <p className="text-white font-medium">{service.address}</p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Fecha Sugerida</p>
                  <p className="text-white font-medium">
                    {formatDate(service.suggestedDate)}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">
                    Persona de Contacto
                  </p>
                  <p className="text-white font-medium">
                    {service.contactPerson}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">
                    Teléfono de Contacto
                  </p>
                  <p className="text-white font-medium">
                    {service.contactPhone}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "documents" && (
          <ServiceDocuments
            serviceId={service.id}
            serviceType={service.serviceType}
            status={service.status}
            documents={service.documents}
          />
        )}

        {activeTab === "inspections" && (
          <ServiceInspections
            serviceId={service.id}
            serviceType={service.serviceType}
            status={service.status}
            inspections={service.inspections}
          />
        )}

        {activeTab === "evidence" && (
          <ServiceEvidence
            serviceId={service.id}
            status={service.status}
            evidences={service.evidences}
          />
        )}
      </Card>
    </div>
  );
}
