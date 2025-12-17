"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Service {
  id: string;
  serviceType: string;
  status: string;
  description: string;
  address: string;
  startDate: string | null;
  empresaContratante: string;
  municipio: string;
  fechaInicio: string;
  fechaTerminacion: string;
  horarioEjecucion: string;
  requiredDocs?: string[]; // Documentos configurados
  requiredInspections?: string[]; // Inspecciones configuradas
  employee: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
}

const SERVICE_TYPES: { [key: string]: string } = {
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

export default function ClientInProgressPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInProgressServices();
  }, []);

  const fetchInProgressServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar servicios");
      }

      // Filtrar solo servicios en progreso
      const inProgress = data.services.filter(
        (s: Service) => s.status === "IN_PROGRESS"
      );
      setServices(inProgress);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="cyber">
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
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
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="secondary" onClick={fetchInProgressServices}>
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Servicios en Progreso
        </h1>
        <p className="text-gray-400">
          Monitorea el avance de tus servicios activos en tiempo real
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="cyber">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Servicios Activos</p>
              <p className="text-2xl font-bold text-white">{services.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="cyber">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Empleados Asignados</p>
              <p className="text-2xl font-bold text-white">
                {
                  new Set(services.map((s) => s.employee?.id).filter(Boolean))
                    .size
                }
              </p>
            </div>
          </div>
        </Card>

        <Card variant="cyber">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600 to-red-600">
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
              <p className="text-gray-400 text-sm">Próximo a Finalizar</p>
              <p className="text-2xl font-bold text-white">
                {
                  services.filter(
                    (s) => getDaysRemaining(s.fechaTerminacion) <= 3
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Services List */}
      <AnimatePresence>
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="cyber">
              <div className="text-center py-12">
                <motion.svg
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 text-gray-500 mx-auto mb-4"
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
                </motion.svg>
                <p className="text-gray-400 mb-2 text-lg font-semibold">
                  No tienes servicios en progreso
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Cuando un empleado inicie un servicio, aparecerá aquí
                </p>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/dashboard/client")}
                >
                  Volver al Dashboard
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {services.map((service, index) => {
              const daysRemaining = getDaysRemaining(service.fechaTerminacion);
              const isUrgent = daysRemaining <= 3;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="cyber" hover>
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="p-2 rounded-lg bg-purple-500/20"
                            >
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
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </motion.div>
                            <h3 className="text-xl font-bold text-white">
                              {SERVICE_TYPES[service.serviceType]}
                            </h3>
                          </div>
                          <p className="text-gray-300 mb-3">
                            {service.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/50">
                              En Progreso
                            </span>
                            {isUrgent && (
                              <motion.span
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                }}
                                className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/50"
                              >
                                ¡Próximo a finalizar!
                              </motion.span>
                            )}
                          </div>
                        </div>

                        {/* Days Remaining */}
                        <div
                          className={`text-center p-4 rounded-xl ${
                            isUrgent
                              ? "bg-red-500/10 border border-red-500/50"
                              : "bg-gray-800/50 border border-gray-700"
                          }`}
                        >
                          <p className="text-3xl font-bold text-white mb-1">
                            {daysRemaining > 0 ? daysRemaining : 0}
                          </p>
                          <p className="text-xs text-gray-400">
                            {daysRemaining === 1
                              ? "día restante"
                              : "días restantes"}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">
                            Información del Servicio
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <svg
                                className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
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
                                <p className="text-xs text-gray-500">Empresa</p>
                                <p className="text-sm text-white">
                                  {service.empresaContratante}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <svg
                                className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
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
                              <div>
                                <p className="text-xs text-gray-500">
                                  Ubicación
                                </p>
                                <p className="text-sm text-white">
                                  {service.municipio}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <svg
                                className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
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
                              <div>
                                <p className="text-xs text-gray-500">Horario</p>
                                <p className="text-sm text-white">
                                  {service.horarioEjecucion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3">
                            Empleado Asignado
                          </h4>
                          {service.employee ? (
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {service.employee.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-semibold">
                                    {service.employee.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {service.employee.email}
                                  </p>
                                </div>
                              </div>
                              {service.employee.phone && (
                                <a
                                  href={`tel:${service.employee.phone}`}
                                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                                >
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
                                  {service.employee.phone}
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm">
                              Sin empleado asignado
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="border-t border-gray-700 pt-6">
                        <h4 className="text-sm font-semibold text-gray-400 mb-4">
                          Cronograma
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Inicio</p>
                            <p className="text-sm text-white">
                              {formatDate(service.fechaInicio)}
                            </p>
                          </div>
                          <div className="flex-1 border-t-2 border-dashed border-purple-500/50 relative">
                            <motion.div
                              className="absolute top-0 left-0 h-0.5 bg-purple-500"
                              initial={{ width: "0%" }}
                              animate={{ width: "60%" }}
                              transition={{ duration: 1.5 }}
                            />
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-xs text-gray-500 mb-1">
                              Finalización
                            </p>
                            <p className="text-sm text-white">
                              {formatDate(service.fechaTerminacion)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() =>
                            router.push(
                              `/dashboard/client/requests/${service.id}`
                            )
                          }
                        >
                          Ver Detalles
                        </Button>
                        <Button variant="primary" size="sm" fullWidth>
                          Contactar Empleado
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
