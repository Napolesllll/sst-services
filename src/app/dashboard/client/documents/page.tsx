"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Document {
  id: string;
  documentType: string;
  createdAt: string;
  completedAt: string | null;
  fileUrl: string | null;
  service: {
    id: string;
    serviceType: string;
    empresaContratante: string;
  };
}

const DOCUMENT_TYPES: { [key: string]: { label: string; icon: string } } = {
  CHARLA_SEGURIDAD: {
    label: "Charla de Seguridad",
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  ATS: {
    label: "Análisis de Trabajo Seguro (ATS)",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  PERMISO_TRABAJO: {
    label: "Permiso de Trabajo",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  PERMISO_ALTURAS: {
    label: "Permiso de Trabajo en Alturas",
    icon: "M7 11l5-5m0 0l5 5m-5-5v12",
  },
  PERMISO_ESPACIOS_CONFINADOS: {
    label: "Permiso Espacios Confinados",
    icon: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  },
  PERMISO_TRABAJO_CALIENTE: {
    label: "Permiso de Trabajo en Caliente",
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  },
  PERMISO_ENERGIAS_PELIGROSAS: {
    label: "Permiso Energías Peligrosas",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  PERMISO_OTRO: {
    label: "Otro Permiso",
    icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
};

export default function ClientDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, typeFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services/my-services");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar documentos");
      }

      // Extraer todos los documentos de todos los servicios
      const allDocuments: Document[] = [];
      data.services.forEach((service: any) => {
        if (service.documents && service.documents.length > 0) {
          service.documents.forEach((doc: any) => {
            allDocuments.push({
              ...doc,
              service: {
                id: service.id,
                serviceType: service.serviceType,
                empresaContratante: service.empresaContratante,
              },
            });
          });
        }
      });

      setDocuments(allDocuments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let result = [...documents];

    if (searchTerm) {
      result = result.filter(
        (doc) =>
          DOCUMENT_TYPES[doc.documentType]?.label
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          doc.service.empresaContratante
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "ALL") {
      result = result.filter((doc) => doc.documentType === typeFilter);
    }

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredDocuments(result);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadDocument = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank");
    }
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
          <Button variant="secondary" onClick={fetchDocuments}>
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  const uniqueTypes = Array.from(new Set(documents.map((d) => d.documentType)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Mis Documentos
        </h1>
        <p className="text-gray-400">
          Accede y descarga todos los documentos generados en tus servicios
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Documentos</p>
              <p className="text-2xl font-bold text-white">
                {documents.length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="cyber">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completados</p>
              <p className="text-2xl font-bold text-white">
                {documents.filter((d) => d.completedAt && d.fileUrl).length}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="cyber">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600 to-amber-600">
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
              <p className="text-gray-400 text-sm">En Proceso</p>
              <p className="text-2xl font-bold text-white">
                {documents.filter((d) => !d.completedAt || !d.fileUrl).length}
              </p>
            </div>
          </div>
        </Card>

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
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tipos Diferentes</p>
              <p className="text-2xl font-bold text-white">
                {uniqueTypes.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="cyber">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="ALL">Todos los tipos</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPES[type]?.label || type}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Documents Grid */}
      <AnimatePresence>
        {filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card variant="cyber">
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 mb-2">
                  {searchTerm || typeFilter !== "ALL"
                    ? "No se encontraron documentos con los filtros aplicados"
                    : "Aún no tienes documentos generados"}
                </p>
                <p className="text-gray-500 text-sm">
                  Los documentos aparecerán aquí cuando se generen en tus
                  servicios
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => {
              const docType = DOCUMENT_TYPES[doc.documentType] || {
                label: doc.documentType,
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              };
              const isCompleted = doc.completedAt && doc.fileUrl;

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                >
                  <Card variant="cyber" hover>
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`p-3 rounded-lg ${
                            isCompleted
                              ? "bg-gradient-to-br from-blue-600 to-cyan-600"
                              : "bg-gray-700/50"
                          }`}
                        >
                          <svg
                            className={`w-6 h-6 ${
                              isCompleted ? "text-white" : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={docType.icon}
                            />
                          </svg>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1 line-clamp-2">
                            {docType.label}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {doc.service.empresaContratante}
                          </p>
                        </div>

                        {isCompleted ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/50">
                            Listo
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/50">
                            Proceso
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 mb-4">
                        Creado: {formatDate(doc.createdAt)}
                        {doc.completedAt && (
                          <>
                            <br />
                            Completado: {formatDate(doc.completedAt)}
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          onClick={() =>
                            router.push(
                              `/dashboard/client/requests/${doc.service.id}`
                            )
                          }
                        >
                          Ver Servicio
                        </Button>
                        {isCompleted && (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => downloadDocument(doc)}
                          >
                            Descargar
                          </Button>
                        )}
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
