// components/dashboard/admin/DocumentTemplatesManager.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Template {
  id: string;
  documentType: string;
  templateName: string;
  uploadedBy: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const DOCUMENT_TYPES = [
  { value: "CHARLA_SEGURIDAD", label: "Charla de Seguridad", icon: "🗣️" },
  { value: "ATS", label: "Análisis de Trabajo Seguro (ATS)", icon: "📊" },
  { value: "PERMISO_TRABAJO", label: "Permiso de Trabajo", icon: "✅" },
  {
    value: "PERMISO_ALTURAS",
    label: "Permiso de Trabajo en Alturas",
    icon: "⬆️",
  },
  {
    value: "PERMISO_ESPACIOS_CONFINADOS",
    label: "Permiso de Espacios Confinados",
    icon: "🚪",
  },
];

export default function DocumentTemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/configuration/templates");
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTemplate = (documentType: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".doc,.docx,.pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setUploadingType(documentType);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("instanceId", "template_placeholder");
        formData.append("documentType", documentType);
        formData.append("isTemplate", "true");

        const response = await fetch("/api/services/documents/upload-file", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al subir plantilla");
        }

        alert(`Plantilla de ${documentType} guardada exitosamente`);
        fetchTemplates();
      } catch (error) {
        console.error("Error uploading template:", error);
        alert("Error al subir la plantilla");
      } finally {
        setUploadingType(null);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="cyber">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            Plantillas de Documentos
          </h2>
          <p className="text-gray-400">
            Administra las plantillas de documentos para los servicios
          </p>
        </div>

        <div className="space-y-4">
          {DOCUMENT_TYPES.map((docType) => {
            const template = templates.find(
              (t) => t.documentType === docType.value
            );

            return (
              <motion.div
                key={docType.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-primary-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{docType.icon}</span>
                      <h3 className="text-lg font-semibold text-white">
                        {docType.label}
                      </h3>
                    </div>

                    {template ? (
                      <div className="text-sm text-gray-400">
                        <p>
                          📄 Plantilla:{" "}
                          <span className="text-green-400 font-semibold">
                            {template.templateName}
                          </span>
                        </p>
                        <p className="mt-1">
                          Subida por: {template.user.name} (
                          {template.user.email})
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(template.createdAt).toLocaleDateString(
                            "es-CO"
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No hay plantilla cargada para este documento
                      </p>
                    )}
                  </div>

                  <Button
                    variant={template ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleUploadTemplate(docType.value)}
                    disabled={uploadingType === docType.value}
                  >
                    {uploadingType === docType.value
                      ? "Subiendo..."
                      : template
                      ? "Actualizar"
                      : "Subir"}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <Card variant="cyber">
        <h3 className="text-lg font-semibold text-white mb-3">
          ℹ️ Instrucciones
        </h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            1. <strong>Crea o sube un archivo Word/PDF</strong> con el formato
            deseado para el tipo de documento
          </p>
          <p>
            2. <strong>Haz clic en "Subir"</strong> y selecciona tu archivo
          </p>
          <p>
            3. <strong>El sistema guardará esta plantilla</strong> como formato
            maestro
          </p>
          <p>
            4. <strong>Cuando se descarguen documentos</strong>, usarán este
            formato exactamente
          </p>
          <p className="mt-4 bg-blue-500/10 p-3 rounded border border-blue-500/30">
            💡 <strong>Consejo:</strong> El archivo Word debe contener campos o
            espacios donde se rellenarán los datos. Por ejemplo: "Tema: ____" o
            "Participantes: ____"
          </p>
        </div>
      </Card>
    </div>
  );
}
