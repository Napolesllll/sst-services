"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import PermisoAlturasModal from "./PermisoAlturasModal";
import PermisoEspaciosConfinadosModal from "./PermisoEspaciosConfinadosModal";
import PermisoTrabajoModal from "./PermisoTrabajoModal";

interface Document {
    id: string;
    documentType: string;
    completedAt: string | null;
    content: any;
    isGroupDocument?: boolean;
    instanceNumber?: number | null;
}

interface CriticalTasksProps {
    serviceId: string;
    serviceType: string;
    status: string;
    documents: Document[];
    configuredDocs?: string[];
}

const taskConfig: {
    [key: string]: { label: string; description: string; icon: string };
} = {
    PERMISO_ALTURAS: {
        label: "Permiso de Trabajo en Alturas",
        description: "Autorización específica para trabajo en alturas",
        icon: "⬆️",
    },
    PERMISO_ESPACIOS_CONFINADOS: {
        label: "Permiso de Espacios Confinados",
        description: "Autorización para ingreso a espacios confinados",
        icon: "🚪",
    },
    PERMISO_TRABAJO: {
        label: "Permiso de Trabajo",
        description: "Autorización general para realizar el trabajo",
        icon: "✅",
    },
};

export default function CriticalTasks({
    serviceId,
    serviceType,
    status,
    documents,
    configuredDocs = [],
}: CriticalTasksProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [requiredTasks, setRequiredTasks] = useState<string[]>([]);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    const [showPermisoAlturasModal, setShowPermisoAlturasModal] = useState(false);
    const [showPermisoEspaciosModal, setShowPermisoEspaciosModal] =
        useState(false);
    const [showPermisoTrabajoModal, setShowPermisoTrabajoModal] = useState(false);

    useEffect(() => {
        fetchRequiredTasks();
    }, [serviceType, configuredDocs]);

    const fetchRequiredTasks = async () => {
        try {
            setLoadingConfig(true);

            if (configuredDocs && configuredDocs.length > 0) {
                // Filtrar solo los permisos del configuredDocs
                const permisos = configuredDocs.filter((doc) =>
                    doc.startsWith("PERMISO_")
                );
                setRequiredTasks(permisos);
                return;
            }

            const response = await fetch(
                `/api/configuration/required-documents?serviceType=${serviceType}`
            );
            const data = await response.json();

            if (response.ok) {
                // Filtrar solo los permisos
                const permisos = (data.requiredDocuments || []).filter((doc: string) =>
                    doc.startsWith("PERMISO_")
                );
                setRequiredTasks(permisos);
            } else {
                const defaultPermisos = getDefaultRequiredTasks(serviceType);
                setRequiredTasks(defaultPermisos);
            }
        } catch (error) {
            console.error("Error fetching required tasks:", error);
            const defaultPermisos = getDefaultRequiredTasks(serviceType);
            setRequiredTasks(defaultPermisos);
        } finally {
            setLoadingConfig(false);
        }
    };

    const getDefaultRequiredTasks = (serviceType: string): string[] => {
        const specificTasks: { [key: string]: string[] } = {
            COORDINADOR_ALTURAS: ["PERMISO_ALTURAS"],
            SUPERVISOR_ESPACIOS_CONFINADOS: ["PERMISO_ESPACIOS_CONFINADOS"],
            ANDAMIERO: ["PERMISO_ALTURAS"],
            RESCATISTA: ["PERMISO_ALTURAS", "PERMISO_ESPACIOS_CONFINADOS"],
            PROFESIONAL_SST: ["PERMISO_TRABAJO"],
            TECNOLOGO_SST: ["PERMISO_TRABAJO"],
            TECNICO_SST: ["PERMISO_TRABAJO"],
        };

        return specificTasks[serviceType] || [];
    };

    const getTaskStatus = (taskType: string) => {
        const groupDoc = documents.find(
            (d) => d.documentType === taskType && d.isGroupDocument === true
        );

        if (groupDoc && groupDoc.completedAt) {
            return "completed";
        }

        return "pending";
    };

    const getTaskInstanceCount = (taskType: string): number => {
        return documents.filter(
            (d) => d.documentType === taskType && d.isGroupDocument === false
        ).length;
    };

    const handleCreateTask = async (taskType: string) => {
        setSelectedTask(taskType);

        if (taskType === "PERMISO_ALTURAS") {
            setShowPermisoAlturasModal(true);
        } else if (taskType === "PERMISO_ESPACIOS_CONFINADOS") {
            setShowPermisoEspaciosModal(true);
        } else if (taskType === "PERMISO_TRABAJO") {
            setShowPermisoTrabajoModal(true);
        }
    };

    const handleTaskSuccess = () => {
        setShowPermisoAlturasModal(false);
        setShowPermisoEspaciosModal(false);
        setShowPermisoTrabajoModal(false);
        setSelectedTask(null);
        router.refresh();
    };

    if (loadingConfig) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (requiredTasks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                    <svg
                        className="w-8 h-8 text-blue-400"
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
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                    Sin Tareas Críticas
                </h3>
                <p className="text-gray-400">
                    Este tipo de servicio no requiere permisos específicos
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Alerta informativa */}
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                    <svg
                        className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4v2m0-10a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-red-400 mb-1">
                            Tareas Críticas Requeridas
                        </p>
                        <p className="text-sm text-gray-300">
                            Estos permisos deben completarse antes de finalizar el servicio.
                            Son críticos para la seguridad y cumplimiento normativo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de tareas */}
            <div className="grid grid-cols-1 gap-4">
                {requiredTasks.map((taskType, index) => {
                    const config = taskConfig[taskType];

                    if (!config) {
                        console.warn(`No config found for task type: ${taskType}`);
                        return null;
                    }

                    const taskStatus = getTaskStatus(taskType);
                    const instanceCount = getTaskInstanceCount(taskType);

                    return (
                        <motion.div
                            key={taskType}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-5 rounded-lg border transition-all ${taskStatus === "completed"
                                    ? "bg-red-500/10 border-red-500/30"
                                    : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Icono */}
                                    <div
                                        className={`text-4xl ${taskStatus === "completed"
                                                ? "grayscale-0"
                                                : "grayscale opacity-50"
                                            }`}
                                    >
                                        {config.icon}
                                    </div>

                                    {/* Información */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h4 className="font-semibold text-white">
                                                {config.label}
                                            </h4>
                                            {taskStatus === "completed" && (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/50">
                                                        ✓ {instanceCount} registro
                                                        {instanceCount !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            )}
                                            {taskStatus === "pending" && (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/50">
                                                    Sin registros
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {config.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2 flex-shrink-0">
                                    {taskStatus === "completed" ? (
                                        <>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                disabled
                                                icon={
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
                                                            d="M4 6h16M4 10h16M4 14h16M4 18h16"
                                                        />
                                                    </svg>
                                                }
                                            >
                                                Gestionar ({instanceCount})
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleCreateTask(taskType)}
                                                disabled={status !== "IN_PROGRESS"}
                                                icon={
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
                                                            d="M12 4v16m8-8H4"
                                                        />
                                                    </svg>
                                                }
                                            >
                                                Nuevo
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleCreateTask(taskType)}
                                            disabled={status !== "IN_PROGRESS"}
                                        >
                                            Crear Registro
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Resumen */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Permisos Requeridos</p>
                        <p className="text-2xl font-bold text-white">
                            {requiredTasks.filter((taskType) => getTaskStatus(taskType) === "completed").length} /{" "}
                            {requiredTasks.length}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Total de registros:{" "}
                            {documents.filter((d) => d.isGroupDocument === false).length}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="w-32 h-32 relative">
                            <svg className="transform -rotate-90 w-32 h-32">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-gray-700"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={`${(requiredTasks.filter(
                                        (taskType) => getTaskStatus(taskType) === "completed"
                                    ).length /
                                            requiredTasks.length) *
                                        352
                                        } 352`}
                                    className="text-red-500"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {Math.round(
                                        (requiredTasks.filter(
                                            (taskType) => getTaskStatus(taskType) === "completed"
                                        ).length /
                                            requiredTasks.length) *
                                        100
                                    )}
                                    %
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales de creación */}
            {showPermisoAlturasModal && (
                <PermisoAlturasModal
                    serviceId={serviceId}
                    onClose={() => setShowPermisoAlturasModal(false)}
                    onSuccess={handleTaskSuccess}
                />
            )}

            {showPermisoEspaciosModal && (
                <PermisoEspaciosConfinadosModal
                    serviceId={serviceId}
                    onClose={() => setShowPermisoEspaciosModal(false)}
                    onSuccess={handleTaskSuccess}
                />
            )}

            {showPermisoTrabajoModal && (
                <PermisoTrabajoModal
                    serviceId={serviceId}
                    onClose={() => setShowPermisoTrabajoModal(false)}
                    onSuccess={handleTaskSuccess}
                />
            )}
        </motion.div>
    );
}
