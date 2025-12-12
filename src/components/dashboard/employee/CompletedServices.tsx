"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface Service {
  id: string;
  serviceType: string;
  description: string;
  empresaContratante: string;
  municipio: string;
  completedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  client: {
    name: string;
  };
  documents: any[];
  inspections: any[];
}

const getServiceTypeName = (type: string): string => {
  const names: { [key: string]: string } = {
    PROFESIONAL_SST: "Profesional SST",
    TECNOLOGO_SST: "Tecnólogo SST",
    COORDINADOR_ALTURAS: "Coordinador de Alturas",
    RESCATISTA: "Rescatista",
    OTRO: "Otro",
  };
  return names[type] || type;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateDuration = (start: string | null, end: string | null) => {
  if (!start || !end) return "N/A";
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
};

export default function CompletedServices({
  services,
}: {
  services: Service[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const filteredServices =
    filter === "all"
      ? services
      : services.filter((s) => s.serviceType === filter);

  if (services.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
          <svg
            className="w-10 h-10 text-green-400"
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
        <h3 className="text-xl font-semibold text-white mb-2">
          Aún no has completado servicios
        </h3>
        <p className="text-gray-400 mb-6">
          Los servicios finalizados aparecerán aquí
        </p>
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/employee")}
        >
          Volver al Dashboard
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-green-500 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Todos ({services.length})
        </button>
      </div>

      {/* Lista de servicios */}
      <div className="grid grid-cols-1 gap-4">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-gray-900/50 border border-green-700/50 hover:border-green-500/70 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {service.empresaContratante}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                    ✅ Completado
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400 font-semibold">
                    {getServiceTypeName(service.serviceType)}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{service.municipio}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{service.client.name}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Completado</p>
                <p className="text-sm text-white font-medium">
                  {formatDate(service.completedAt)}
                </p>
              </div>
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Duración</p>
                <p className="text-sm text-white font-medium">
                  {calculateDuration(service.startDate, service.endDate)}
                </p>
              </div>
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Documentos</p>
                <p className="text-sm text-blue-400 font-bold">
                  {service.documents.length}
                </p>
              </div>
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Inspecciones</p>
                <p className="text-sm text-green-400 font-bold">
                  {service.inspections.length}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                router.push(`/dashboard/employee/service/${service.id}`)
              }
            >
              Ver Detalles
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
