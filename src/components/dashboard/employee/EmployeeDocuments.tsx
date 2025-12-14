"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  documentType: string;
  completedAt: Date | null;
  createdAt: Date;
  service: {
    id: string;
    serviceType: string;
    empresaContratante: string;
    municipio: string;
    status: string;
    client: {
      name: string;
    };
  };
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  byType: Record<string, number>;
}

const documentConfig: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  CHARLA_SEGURIDAD: {
    label: "Charla de Seguridad",
    icon: "🗣️",
    color: "blue",
  },
  ATS: { label: "ATS", icon: "📊", color: "cyan" },
  PERMISO_TRABAJO: { label: "Permiso de Trabajo", icon: "✅", color: "green" },
  PERMISO_ALTURAS: { label: "Permiso Alturas", icon: "⬆️", color: "orange" },
  PERMISO_ESPACIOS_CONFINADOS: {
    label: "Permiso Espacios Confinados",
    icon: "🚪",
    color: "purple",
  },
};

export default function EmployeeDocuments({
  documents,
  stats,
}: {
  documents: Document[];
  stats: Stats;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");

  const filteredDocs =
    filter === "all"
      ? documents
      : documents.filter((d) => d.documentType === filter);

  if (documents.length === 0) {
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
          No hay documentos generados
        </h3>
        <p className="text-gray-400">
          Los documentos que generes en los servicios aparecerán aquí
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-gray-900/50 border border-blue-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <svg
                className="w-6 h-6 text-blue-400"
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
            <div>
              <p className="text-gray-400 text-sm">Total Documentos</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-gray-900/50 border border-green-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <svg
                className="w-6 h-6 text-green-400"
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
            <div>
              <p className="text-gray-400 text-sm">Completados</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl bg-gradient-to-br from-yellow-900/20 to-gray-900/50 border border-yellow-700/50"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <svg
                className="w-6 h-6 text-yellow-400"
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
              <p className="text-gray-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-primary-500 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          Todos ({documents.length})
        </button>
        {Object.entries(stats.byType).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === type
                ? "bg-primary-500 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {documentConfig[type]?.icon} {documentConfig[type]?.label || type} (
            {count})
          </button>
        ))}
      </div>

      {/* Lista de documentos */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocs.map((doc, index) => {
          const config = documentConfig[doc.documentType] || {
            label: doc.documentType,
            icon: "📄",
            color: "gray",
          };

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-primary-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{config.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {config.label}
                      </h3>
                      {doc.completedAt ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                          ✅ Completado
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                          ⏳ Pendiente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      Servicio: {doc.service.empresaContratante} -{" "}
                      {doc.service.municipio}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cliente: {doc.service.client.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Creado:{" "}
                      {new Date(doc.createdAt).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    router.push(`/dashboard/employee/service/${doc.service.id}`)
                  }
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-all"
                >
                  Ver Servicio
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
