"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Tipos de servicio según tu estructura
const SERVICE_TYPES = [
  { value: "PROFESIONAL_SST", label: "Profesional SST" },
  { value: "TECNOLOGO_SST", label: "Tecnólogo SST" },
  { value: "TECNICO_SST", label: "Técnico SST" },
  { value: "COORDINADOR_ALTURAS", label: "Coordinador de Alturas" },
  {
    value: "SUPERVISOR_ESPACIOS_CONFINADOS",
    label: "Supervisor Espacios Confinados",
  },
  { value: "CAPACITACIONES_CURSOS", label: "Capacitaciones o Cursos" },
  { value: "ALQUILER_EQUIPOS", label: "Alquiler de Equipos" },
  { value: "ANDAMIERO", label: "Andamiero" },
  { value: "AUDITORIA_SG_SST", label: "Auditoría SG-SST" },
  { value: "RESCATISTA", label: "Rescatista" },
  { value: "TAPH_PARAMEDICO", label: "TAPH (Paramédico)" },
  { value: "AUXILIAR_OPERATIVO", label: "Auxiliar Operativo" },
  { value: "SERVICIOS_ADMINISTRATIVOS", label: "Servicios Administrativos" },
  { value: "NOMINA", label: "Nómina" },
  { value: "FACTURACION", label: "Facturación" },
  { value: "CONTRATOS", label: "Contratos" },
  { value: "SEGURIDAD_SOCIAL", label: "Seguridad Social" },
  { value: "OTRO", label: "Otro" },
];

export default function ServiceRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    serviceType: "",
    description: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
    suggestedDate: "",
    suggestedTime: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validaciones
      if (!formData.serviceType) {
        throw new Error("Debes seleccionar un tipo de servicio");
      }

      if (!formData.description.trim()) {
        throw new Error("La descripción es requerida");
      }

      if (!formData.address.trim()) {
        throw new Error("La dirección es requerida");
      }

      if (!formData.contactPerson.trim()) {
        throw new Error("La persona de contacto es requerida");
      }

      if (!formData.contactPhone.trim()) {
        throw new Error("El teléfono es requerido");
      }

      if (!formData.suggestedDate || !formData.suggestedTime) {
        throw new Error("La fecha y hora sugerida son requeridas");
      }

      // Combinar fecha y hora
      const suggestedDateTime = `${formData.suggestedDate}T${formData.suggestedTime}`;

      // Preparar datos para enviar
      const requestData = {
        serviceType: formData.serviceType,
        description: formData.description,
        address: formData.address,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        suggestedDate: suggestedDateTime,
      };

      // Enviar solicitud
      const response = await fetch("/api/services/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la solicitud");
      }

      // Éxito
      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard/client");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card variant="cyber">
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 mb-6 shadow-neon"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Solicitud Creada Exitosamente!
            </h2>
            <p className="text-gray-400 mb-8">
              Nuestro equipo revisará tu solicitud y asignará un profesional
              calificado en breve.
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo al dashboard...
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card variant="cyber">
        <div className="space-y-6">
          {/* Tipo de Servicio */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Tipo de Servicio <span className="text-red-500">*</span>
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="">Selecciona un servicio...</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción de la necesidad */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Descripción de la Necesidad{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe detalladamente el servicio que necesitas..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
            />
          </div>

          {/* Dirección */}
          <Input
            type="text"
            name="address"
            label="Dirección del Servicio"
            placeholder="Calle 123 #45-67, Ciudad"
            value={formData.address}
            onChange={handleChange}
            required
            icon={
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />

          {/* Persona de Contacto */}
          <Input
            type="text"
            name="contactPerson"
            label="Persona de Contacto"
            placeholder="Nombre completo"
            value={formData.contactPerson}
            onChange={handleChange}
            required
            icon={
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
            }
          />

          {/* Teléfono */}
          <Input
            type="tel"
            name="contactPhone"
            label="Teléfono de Contacto"
            placeholder="+57 300 123 4567"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            icon={
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
            }
          />

          {/* Fecha y Hora Sugerida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              name="suggestedDate"
              label="Fecha Sugerida"
              value={formData.suggestedDate}
              onChange={handleChange}
              required
              icon={
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
              }
            />

            <Input
              type="time"
              name="suggestedTime"
              label="Hora Sugerida"
              value={formData.suggestedTime}
              onChange={handleChange}
              required
              icon={
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* Documentos o Fotos (Opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Documentos o Fotos (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-gray-400 text-sm">
                  Click para subir archivos o arrastra aquí
                </span>
                <span className="text-gray-500 text-xs mt-1">
                  PDF, DOC, DOCX, Imágenes (Max. 5MB cada uno)
                </span>
              </label>
            </div>

            {/* Lista de archivos seleccionados */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-primary-400"
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
                      <div>
                        <p className="text-sm text-white">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400"
            >
              <div className="flex items-center gap-2">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            </motion.div>
          )}

          {/* Botones */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
            >
              Enviar Solicitud
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
