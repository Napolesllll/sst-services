"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface Service {
  id: string;
  serviceType: string;
  status: string;
  description: string;
  empresaContratante: string;
  personaSolicita: string;
  municipio: string;
  fechaInicio: string;
  fechaTerminacion: string;
  contactPerson: string;
  contactPhone: string;
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
    CAPACITACIONES_CURSOS: "Capacitaciones",
    ALQUILER_EQUIPOS: "Alquiler de Equipos",
    ANDAMIERO: "Andamiero",
    AUDITORIA_SG_SST: "Auditoría SG-SST",
    RESCATISTA: "Rescatista",
    TAPH_PARAMEDICO: "TAPH",
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
  return new Date(dateString).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function AssignedServices({
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
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-4">
          <svg
            className="w-10 h-10 text-blue-400"
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
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No hay servicios asignados
        </h3>
        <p className="text-gray-400 mb-6">
          Cuando se te asignen nuevos servicios aparecerán aquí
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
    <div className="grid grid-cols-1 gap-6">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-blue-500/50 transition-all shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {service.empresaContratante}
              </h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-cyan-400 font-semibold">
                  {getServiceTypeName(service.serviceType)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{service.municipio}</span>
              </div>
              <p className="text-sm text-gray-400">
                Solicitado por: {service.personaSolicita}
              </p>
            </div>
            <span className="px-4 py-2 rounded-full text-xs font-semibold border bg-blue-500/20 text-blue-400 border-blue-500/50">
              ⏳ Asignado
            </span>
          </div>

          <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-300 text-sm">{service.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-green-400 mb-2">
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
                <span className="font-semibold text-xs">Inicio</span>
              </div>
              <p className="text-white text-sm">
                {formatDate(service.fechaInicio)}
              </p>
            </div>

            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-red-400 mb-2">
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
                <span className="font-semibold text-xs">Fin</span>
              </div>
              <p className="text-white text-sm">
                {formatDate(service.fechaTerminacion)}
              </p>
            </div>

            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
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
                <span className="font-semibold text-xs">Coordinador</span>
              </div>
              <p className="text-white text-sm font-medium">
                {service.contactPerson}
              </p>
              <a
                href={`tel:${service.contactPhone}`}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                {service.contactPhone}
              </a>
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
              Ver Detalles e Iniciar
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
