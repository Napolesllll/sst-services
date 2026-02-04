"use client";

import React from "react";
import { useState } from "react";

// Tipos
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

// Configuración de documentos
const documentConfig: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  CHARLA_SEGURIDAD: { label: "Charla de Seguridad", icon: "🗣️", color: "blue" },
  ATS: { label: "ATS", icon: "📊", color: "cyan" },
  PERMISO_TRABAJO: { label: "Permiso de Trabajo", icon: "✅", color: "green" },
  PERMISO_ALTURAS: { label: "Permiso Alturas", icon: "⬆️", color: "orange" },
  PERMISO_ESPACIOS_CONFINADOS: {
    label: "Permiso Espacios Confinados",
    icon: "🚪",
    color: "purple",
  },
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

// Agrupar documentos por servicio
function groupDocumentsByService(documents: Document[]) {
  const grouped = new Map<
    string,
    {
      service: Document["service"];
      documents: Document[];
      completed: number;
      pending: number;
    }
  >();

  documents.forEach((doc) => {
    const serviceId = doc.service.id;
    if (!grouped.has(serviceId)) {
      grouped.set(serviceId, {
        service: doc.service,
        documents: [],
        completed: 0,
        pending: 0,
      });
    }

    const group = grouped.get(serviceId)!;
    group.documents.push(doc);
    if (doc.completedAt) {
      group.completed++;
    } else {
      group.pending++;
    }
  });

  return Array.from(grouped.values()).sort((a, b) => {
    // Ordenar: pendientes primero, luego por fecha más reciente
    if (a.pending > 0 && b.pending === 0) return -1;
    if (a.pending === 0 && b.pending > 0) return 1;
    return (
      new Date(b.documents[0].createdAt).getTime() -
      new Date(a.documents[0].createdAt).getTime()
    );
  });
}

export default function EmployeeDocuments({
  documents,
  stats,
}: {
  documents: Document[];
  stats: Stats;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [expandedServices, setExpandedServices] = useState<Set<string>>(
    new Set()
  );

  const filteredDocs =
    filter === "all"
      ? documents
      : documents.filter((d) => d.documentType === filter);

  const groupedServices = groupDocumentsByService(filteredDocs);

  const toggleService = (serviceId: string) => {
    setExpandedServices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-gray-900/50 border border-blue-700/50">
          <div className="flex items-center gap-3">
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
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/20 to-gray-900/50 border border-green-700/50">
          <div className="flex items-center gap-3">
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
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-900/20 to-gray-900/50 border border-yellow-700/50">
          <div className="flex items-center gap-3">
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
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-900/20 to-gray-900/50 border border-purple-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Servicios</p>
              <p className="text-2xl font-bold text-white">
                {groupedServices.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
              : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
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
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {documentConfig[type]?.icon} {documentConfig[type]?.label || type} (
            {count})
          </button>
        ))}
      </div>

      {/* Servicios Agrupados */}
      <div className="space-y-4">
        {groupedServices.map((group) => {
          const isExpanded = expandedServices.has(group.service.id);
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
          const status =
            statusConfig[group.service.status as keyof typeof statusConfig] ||
            statusConfig.ASSIGNED;

          return (
            <div
              key={group.service.id}
              className="rounded-xl bg-gray-800/50 border border-gray-700 overflow-hidden"
            >
              {/* Header del Servicio */}
              <button
                onClick={() => toggleService(group.service.id)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-800/70 transition-all"
              >
                <div className="flex items-start gap-4 flex-1 text-left">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
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
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-white">
                        {getServiceTypeName(group.service.serviceType)}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-1">
                      📍 {group.service.empresaContratante} -{" "}
                      {group.service.municipio}
                    </p>
                    <p className="text-xs text-gray-400">
                      👤 Cliente: {group.service.client.name}
                    </p>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-gray-400">
                        📄 {group.documents.length} documento
                        {group.documents.length !== 1 ? "s" : ""}
                      </span>
                      {group.completed > 0 && (
                        <span className="text-sm text-green-400">
                          ✅ {group.completed} completado
                          {group.completed !== 1 ? "s" : ""}
                        </span>
                      )}
                      {group.pending > 0 && (
                        <span className="text-sm text-yellow-400">
                          ⏳ {group.pending} pendiente
                          {group.pending !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <a
                    href={`/dashboard/employee/service/${group.service.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    Ver Servicio
                  </a>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
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
                  </svg>
                </div>
              </button>

              {/* Lista de Documentos (Expandible) */}
              {isExpanded && (
                <div className="border-t border-gray-700 bg-gray-900/30">
                  <div className="p-5 space-y-3">
                    {group.documents.map((doc) => {
                      const config = documentConfig[doc.documentType] || {
                        label: doc.documentType,
                        icon: "📄",
                        color: "gray",
                      };

                      return (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{config.icon}</div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-semibold text-white">
                                  {config.label}
                                </h4>
                                {doc.completedAt ? (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                                    ✅ Completado
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                                    ⏳ Pendiente
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Creado:{" "}
                                {new Date(doc.createdAt).toLocaleDateString(
                                  "es-CO",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {groupedServices.length === 0 && filteredDocs.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No se encontraron documentos con el filtro seleccionado
        </div>
      )}
    </div>
  );
}
