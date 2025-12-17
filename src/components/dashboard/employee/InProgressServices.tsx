"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface Service {
  id: string;
  serviceType: string;
  description: string;
  empresaContratante: string;
  municipio: string;
  startDate: Date | null;
  contactPerson: string;
  contactPhone: string;
  requiredDocs?: string[]; // Documentos configurados
  requiredInspections?: string[]; // Inspecciones configuradas
  client: {
    name: string;
  };
  documents: any[];
  inspections: any[];
  evidences: any[];
}

const getServiceTypeName = (type: string): string => {
  const names: { [key: string]: string } = {
    PROFESIONAL_SST: "Profesional SST",
    TECNOLOGO_SST: "Tecnólogo SST",
    TECNICO_SST: "Técnico SST",
    COORDINADOR_ALTURAS: "Coordinador de Alturas",
    SUPERVISOR_ESPACIOS_CONFINADOS: "Supervisor Espacios Confinados",
    CAPACITACIONES_CURSOS: "Capacitaciones",
    ANDAMIERO: "Andamiero",
    RESCATISTA: "Rescatista",
    OTRO: "Otro",
  };
  return names[type] || type;
};

export default function InProgressServices({
  services,
}: {
  services: Service[];
}) {
  const router = useRouter();

  if (services.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 mb-4">
          <svg
            className="w-10 h-10 text-purple-400"
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
        <h3 className="text-xl font-semibold text-white mb-2">
          No hay servicios en progreso
        </h3>
        <p className="text-gray-400 mb-6">
          Inicia un servicio asignado para verlo aquí
        </p>
        <Button
          variant="secondary"
          onClick={() => router.push("/dashboard/employee/assigned")}
        >
          Ver Servicios Asignados
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {services.map((service, index) => {
        const progress = {
          documents: service.documents.filter((d) => d.completedAt).length,
          inspections: service.inspections.filter((i) => i.completedAt).length,
          evidences: service.evidences.length,
        };

        const totalTasks = 10; // Estimado
        const completedTasks = progress.documents + progress.inspections;
        const progressPercent = Math.min(
          (completedTasks / totalTasks) * 100,
          100
        );

        return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-purple-700/50 hover:border-purple-500/70 transition-all shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {service.empresaContratante}
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-purple-400 font-semibold">
                    {getServiceTypeName(service.serviceType)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{service.municipio}</span>
                </div>
                <p className="text-sm text-gray-400">
                  Cliente: {service.client.name}
                </p>
              </div>
              <span className="px-4 py-2 rounded-full text-xs font-semibold border bg-purple-500/20 text-purple-400 border-purple-500/50">
                🔄 En Progreso
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progreso General</span>
                <span className="text-sm font-semibold text-purple-400">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                />
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                <p className="text-xs text-gray-400 mb-1">Documentos</p>
                <p className="text-lg font-bold text-blue-400">
                  {progress.documents}
                </p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                <p className="text-xs text-gray-400 mb-1">Inspecciones</p>
                <p className="text-lg font-bold text-green-400">
                  {progress.inspections}
                </p>
              </div>
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                <p className="text-xs text-gray-400 mb-1">Evidencias</p>
                <p className="text-lg font-bold text-yellow-400">
                  {progress.evidences}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() =>
                  router.push(`/dashboard/employee/service/${service.id}`)
                }
              >
                Continuar Servicio
              </Button>
              <button
                onClick={() => window.open(`tel:${service.contactPhone}`)}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Llamar
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
