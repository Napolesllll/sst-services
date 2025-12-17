"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: string;
  serviceType: string;
  status: string;
  description: string;
  address: string | null;
  contactPerson: string;
  contactPhone: string;
  suggestedDate: string;
  // Nuevos campos del formulario
  empresaContratante: string;
  personaSolicita: string;
  cantidadRequerida: number;
  equiposUtilizar: string;
  herramientasUtilizar: string;
  maquinasUtilizar: string;
  numeroTrabajadores: number;
  municipio: string;
  empresaPrestacionServicio: string;
  fechaInicio: Date | null;
  fechaTerminacion: Date | null;
  horarioEjecucion: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

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
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
    >
      {config.label}
    </motion.span>
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

const formatDate = (date: any) => {
  if (!date) return "No especificada";

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "No especificada";

    return dateObj.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return "No especificada";
  }
};

const Card = ({
  children,
  variant = "default",
  hover = false,
}: {
  children: React.ReactNode;
  variant?: "default" | "cyber";
  hover?: boolean;
}) => {
  const baseClasses = "rounded-xl p-6 transition-all duration-300";
  const variantClasses = {
    default: "bg-gray-800 border border-gray-700",
    cyber:
      "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700 shadow-xl",
  };
  const hoverClasses = hover
    ? "hover:shadow-2xl hover:border-primary-500/50"
    : "";

  return (
    <div
      className={`${baseClasses} ${
        variantClasses[variant as keyof typeof variantClasses]
      } ${hoverClasses}`}
    >
      {children}
    </div>
  );
};

const Button = ({
  children,
  variant = "primary",
  fullWidth = false,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseClasses =
    "px-6 py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
  };
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default function EmployeeOverview() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar servicios");
      }

      const activeServices = data.services.filter(
        (s: Service) => s.status === "ASSIGNED" || s.status === "IN_PROGRESS"
      );
      setServices(activeServices);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity },
          }}
          className="rounded-full h-12 w-12 border-b-2 border-blue-500"
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="cyber">
          <div className="text-center py-12">
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
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
            </motion.svg>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-red-400"
            >
              {error}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button variant="secondary" onClick={fetchServices}>
                Reintentar
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Estadísticas Rápidas */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {[
          {
            stat: stats.assigned,
            label: "Asignados",
            gradient: "from-blue-600 to-cyan-600",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            delay: 0,
          },
          {
            stat: stats.inProgress,
            label: "En Progreso",
            gradient: "from-purple-600 to-pink-600",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
            delay: 0.1,
          },
          {
            stat: stats.completed,
            label: "Completados",
            gradient: "from-green-600 to-emerald-600",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
            delay: 0.2,
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: item.delay, type: "spring", stiffness: 100 }}
            whileHover={{
              scale: 1.05,
              y: -5,
              transition: { type: "spring", stiffness: 400, damping: 10 },
            }}
          >
            <Card variant="cyber" hover>
              <motion.div
                className="flex items-center gap-4"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  className={`p-3 rounded-lg bg-gradient-to-br ${item.gradient}`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
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
                      d={item.icon}
                    />
                  </svg>
                </motion.div>
                <div>
                  <p className="text-gray-400 text-sm">{item.label}</p>
                  <motion.p
                    className="text-2xl font-bold text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: item.delay + 0.3, type: "spring" }}
                  >
                    {item.stat}
                  </motion.p>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Servicios Asignados */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="cyber">
          <motion.h2
            className="text-2xl font-bold text-white mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Mis Servicios Activos
          </motion.h2>

          {services.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.svg
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </motion.svg>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 mb-2"
              >
                No tienes servicios activos
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500"
              >
                Los servicios asignados aparecerán aquí
              </motion.p>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 gap-6" layout>
              <AnimatePresence>
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    className="p-6 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-blue-500/50 transition-all shadow-lg"
                  >
                    {/* Header del Servicio */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <motion.h3
                          className="text-2xl font-bold text-white mb-2"
                          whileHover={{ color: "#60a5fa" }}
                        >
                          {service.empresaContratante}
                        </motion.h3>
                        Servicio Para{" "}
                        <span className="text-2xl font-bold text-blue mb-2">
                          {service.empresaPrestacionServicio}
                        </span>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-cyan-400 font-semibold text-lg">
                            {getServiceTypeName(service.serviceType)}
                          </span>

                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">
                            {service.cantidadRequerida} trabajadores
                            requerido(s)
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                          Solicitado por: {service.personaSolicita}
                        </p>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>

                    {/* Descripción Principal */}
                    <motion.div
                      className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        Descripción del Servicio
                      </h4>
                      <p className="text-gray-300">{service.description}</p>
                    </motion.div>

                    {/* Grid de Información Principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {/* Ubicación */}
                      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="font-semibold text-sm">
                            Ubicación
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">
                          {service.municipio}
                        </p>
                        {service.address && (
                          <p className="text-gray-400 text-xs">
                            {service.address}
                          </p>
                        )}
                        <p className="text-gray-400 text-xs mt-2">
                          Empresa: {service.empresaPrestacionServicio}
                        </p>
                      </div>

                      {/* Fechas */}
                      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
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
                          <span className="font-semibold text-sm">Periodo</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Inicio:</span>{" "}
                          {formatDate(service.fechaInicio)}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="text-gray-400">Fin:</span>{" "}
                          {formatDate(service.fechaTerminacion)}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          Horario: {service.horarioEjecucion}
                        </p>
                      </div>

                      {/* Contacto */}
                      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
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
                          <span className="font-semibold text-sm">
                            Coordinador
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">
                          {service.contactPerson}
                        </p>
                        <a
                          href={`tel:${service.contactPhone}`}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
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
                          {service.contactPhone}
                        </a>
                      </div>
                    </div>

                    {/* Sección Expandible: Detalles Técnicos */}
                    <motion.div
                      initial={false}
                      className="border-t border-gray-700 pt-4"
                    >
                      <button
                        onClick={() => toggleExpand(service.id)}
                        className="w-full flex items-center justify-between text-left mb-4 hover:text-blue-400 transition-colors"
                      >
                        <span className="font-semibold text-white">
                          Detalles Técnicos del Proyecto
                        </span>
                        <motion.svg
                          animate={{
                            rotate: expandedService === service.id ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </motion.svg>
                      </button>

                      <AnimatePresence>
                        {expandedService === service.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4 overflow-hidden"
                          >
                            {/* Número de Trabajadores */}
                            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                              <svg
                                className="w-5 h-5 text-yellow-400"
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
                              <div>
                                <p className="text-xs text-gray-400">
                                  Número de Trabajadores
                                </p>
                                <p className="text-white font-semibold">
                                  {service.numeroTrabajadores} trabajadores
                                </p>
                              </div>
                            </div>

                            {/* Equipos */}
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                              <h5 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
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
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                  />
                                </svg>
                                Equipos a Utilizar
                              </h5>
                              <p className="text-gray-300 text-sm">
                                {service.equiposUtilizar}
                              </p>
                            </div>

                            {/* Herramientas */}
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                              <h5 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
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
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                Herramientas a Utilizar
                              </h5>
                              <p className="text-gray-300 text-sm">
                                {service.herramientasUtilizar}
                              </p>
                            </div>

                            {/* Máquinas */}
                            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                              <h5 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
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
                                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                                  />
                                </svg>
                                Máquinas a Utilizar
                              </h5>
                              <p className="text-gray-300 text-sm">
                                {service.maquinasUtilizar}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Botones de Acción */}
                    <motion.div
                      className="flex gap-3 pt-4 border-t border-gray-700 mt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Button
                        variant={
                          service.status === "ASSIGNED"
                            ? "primary"
                            : "secondary"
                        }
                        fullWidth
                        onClick={() =>
                          router.push(
                            `/dashboard/employee/service/${service.id}`
                          )
                        }
                      >
                        <div className="flex items-center justify-center gap-2">
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
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                          {service.status === "ASSIGNED"
                            ? "Ver y Comenzar"
                            : "Continuar Servicio"}
                        </div>
                      </Button>

                      <button
                        onClick={() => {
                          // Función para llamar al coordinador
                          window.location.href = `tel:${service.contactPhone}`;
                        }}
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
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
