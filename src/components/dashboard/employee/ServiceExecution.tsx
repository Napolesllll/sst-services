"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 10,
        duration: 0.5,
      }}
      className={`px-4 py-2 rounded-full text-sm font-semibold border ${config.color}`}
      whileHover={{
        scale: 1.05,
        transition: { type: "spring", stiffness: 400, duration: 0.3 },
      }}
    >
      {config.label}
    </motion.span>
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5,
      },
    },
  };

  const buttonIconVariants: Variants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const buttonTextVariants: Variants = {
    initial: { textShadow: "0 0 0px rgba(255,255,255,0)" },
    animate: {
      textShadow: [
        "0 0 0px rgba(255,255,255,0)",
        "0 0 10px rgba(255,255,255,0.8)",
        "0 0 0px rgba(255,255,255,0)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const completeButtonIconVariants: Variants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.3, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const completeButtonTextVariants: Variants = {
    initial: { textShadow: "0 0 0px rgba(255,255,255,0)" },
    animate: {
      textShadow: [
        "0 0 0px rgba(255,255,255,0)",
        "0 0 15px rgba(34, 197, 94, 0.8)",
        "0 0 0px rgba(255,255,255,0)",
      ],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const errorVariants: Variants = {
    hidden: { opacity: 0, y: -10, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  const errorShakeVariants: Variants = {
    animate: {
      x: [0, -5, 5, 0],
      transition: {
        duration: 0.5,
        repeat: 3,
        ease: "easeInOut",
      },
    },
  };

  const tabButtonVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.4,
      },
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
  };

  const badgeVariants: Variants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
        duration: 0.6,
      },
    },
    hover: {
      scale: 1.2,
      transition: {
        type: "spring",
        stiffness: 400,
        duration: 0.2,
      },
    },
  };

  const tabContentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const infoCardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.5,
      },
    },
    hover: {
      scale: 1.02,
      borderColor: "rgba(139, 92, 246, 0.3)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const floatingParticleVariants: Variants = {
    animate: {
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
      y: [0, -30, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const floatingParticle2Variants: Variants = {
    animate: {
      scale: [0, 2, 0],
      opacity: [0, 0.8, 0],
      x: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 relative overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }}
    >
      {/* Efecto de luz de fondo que sigue el cursor */}
      <motion.div
        className="absolute pointer-events-none w-80 h-80 rounded-full bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-3xl"
        animate={{
          x: mousePosition.x - 160,
          y: mousePosition.y - 160,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
        }}
      />

      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card variant="cyber" className="relative overflow-hidden">
          {/* Efecto de fondo animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-cyan-500/5"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 200%" }}
          />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <motion.div variants={itemVariants} className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <motion.button
                    whileHover={{
                      scale: 1.1,
                      x: -5,
                      backgroundColor: "rgba(55, 65, 81, 0.5)",
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <motion.svg
                      animate={{ x: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
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
                    </motion.svg>
                  </motion.button>
                  <motion.h1
                    className="text-3xl font-bold text-white"
                    animate={{
                      backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
                      backgroundSize: "200% 200%",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {getServiceTypeName(service.serviceType)}
                  </motion.h1>
                  {getStatusBadge(service.status)}
                </div>
                <motion.p
                  variants={itemVariants}
                  className="text-gray-400 ml-12"
                >
                  Cliente: {service.client.name}
                </motion.p>
              </motion.div>

              {/* Acciones */}
              <motion.div variants={itemVariants} className="flex gap-3">
                {service.status === "ASSIGNED" && (
                  <Button
                    variant="primary"
                    onClick={handleStartService}
                    loading={loading}
                    icon={
                      <motion.svg
                        variants={buttonIconVariants}
                        initial="initial"
                        animate="animate"
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
                      </motion.svg>
                    }
                  >
                    <motion.span
                      variants={buttonTextVariants}
                      initial="initial"
                      animate="animate"
                    >
                      Iniciar Servicio
                    </motion.span>
                  </Button>
                )}
                {service.status === "IN_PROGRESS" && (
                  <Button
                    variant="primary"
                    onClick={handleCompleteService}
                    loading={loading}
                    icon={
                      <motion.svg
                        variants={completeButtonIconVariants}
                        initial="initial"
                        animate="animate"
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
                      </motion.svg>
                    }
                  >
                    <motion.span
                      variants={completeButtonTextVariants}
                      initial="initial"
                      animate="animate"
                    >
                      Finalizar Servicio
                    </motion.span>
                  </Button>
                )}
              </motion.div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400"
                >
                  <motion.div variants={errorShakeVariants} animate="animate">
                    {error}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card variant="cyber" className="relative overflow-hidden">
          {/* Efecto de partículas en las tabs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary-500/30 rounded-full"
                initial={{
                  x: `${(i * 25) % 100}%`,
                  y: "10%",
                  scale: 0,
                }}
                animate={{
                  y: ["10%", "90%", "10%"],
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <motion.div
              className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-4"
              variants={itemVariants}
            >
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative overflow-hidden ${
                    activeTab === tab.id
                      ? "text-white shadow-neon"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                  variants={tabButtonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ delay: index * 0.1 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg"
                      layoutId="activeTab"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.icon}</span>
                  <span className="relative z-10">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <motion.span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold relative z-10 ${
                        activeTab === tab.id
                          ? "bg-white text-primary-600"
                          : "bg-gray-700 text-gray-300"
                      }`}
                      variants={badgeVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {tab.badge}
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "info" && (
                  <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Descripción */}
                    <motion.div variants={itemVariants}>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Descripción del Servicio
                      </h3>
                      <motion.p
                        className="text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                        variants={infoCardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                      >
                        {service.description}
                      </motion.p>
                    </motion.div>

                    {/* Información del Cliente */}
                    <motion.div variants={itemVariants}>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Información del Cliente
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Nombre", value: service.client.name },
                          { label: "Email", value: service.client.email },
                          ...(service.client.phone
                            ? [
                                {
                                  label: "Teléfono",
                                  value: service.client.phone,
                                },
                              ]
                            : []),
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            variants={infoCardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            transition={{ delay: index * 0.1 }}
                          >
                            <p className="text-sm text-gray-400 mb-1">
                              {item.label}
                            </p>
                            <p className="text-white font-medium">
                              {item.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Detalles del Servicio */}
                    <motion.div variants={itemVariants}>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Detalles del Servicio
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Dirección", value: service.address },
                          {
                            label: "Fecha Sugerida",
                            value: formatDate(service.suggestedDate),
                          },
                          {
                            label: "Persona de Contacto",
                            value: service.contactPerson,
                          },
                          {
                            label: "Teléfono de Contacto",
                            value: service.contactPhone,
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={item.label}
                            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            variants={infoCardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            transition={{ delay: index * 0.1 + 0.2 }}
                          >
                            <p className="text-sm text-gray-400 mb-1">
                              {item.label}
                            </p>
                            <p className="text-white font-medium">
                              {item.value}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
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
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Elementos decorativos flotantes */}
      <motion.div
        className="absolute top-1/4 left-4 w-3 h-3 bg-cyan-400/40 rounded-full"
        variants={floatingParticleVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-1/3 right-4 w-2 h-2 bg-purple-400/50 rounded-full"
        variants={floatingParticle2Variants}
        animate="animate"
      />
    </motion.div>
  );
}
