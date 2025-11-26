"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    serviceType: "",
    description: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
    suggestedDate: "",
    suggestedTime: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

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

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
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
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mx-4 sm:mx-6"
      >
        {/* Efecto de confeti animado */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${
                i % 5 === 0
                  ? "bg-yellow-400"
                  : i % 5 === 1
                  ? "bg-green-400"
                  : i % 5 === 2
                  ? "bg-blue-400"
                  : i % 5 === 3
                  ? "bg-purple-400"
                  : "bg-pink-400"
              }`}
              initial={{
                x: Math.random() * 100 - 50 + "%",
                y: -20,
                scale: 0,
                rotate: 0,
              }}
              animate={{
                x: [
                  Math.random() * 100 - 50 + "%",
                  Math.random() * 100 - 50 + "%",
                ],
                y: ["-20%", "120%"],
                scale: [0, 1, 0.5],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <Card variant="cyber">
          <div className="text-center py-12 relative z-10 px-4 sm:px-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 mb-6 shadow-2xl shadow-green-500/25"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4"
            >
              ¡Solicitud Creada Exitosamente!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 text-base sm:text-lg mb-8 max-w-md mx-auto"
            >
              Nuestro equipo revisará tu solicitud y asignará un profesional
              calificado en breve.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 px-4 py-2 rounded-full"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              Redirigiendo al dashboard...
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  }

  const steps = [
    {
      title: "Tipo de Servicio",
      content: (
        <div className="space-y-6">
          <div>
            <motion.label
              className="block text-sm font-semibold text-gray-300 mb-3"
              whileHover={{ scale: 1.02 }}
            >
              Tipo de Servicio <span className="text-red-500">*</span>
            </motion.label>
            <motion.select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
            >
              <option value="">Selecciona un servicio...</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </motion.select>
          </div>

          <div>
            <motion.label
              className="block text-sm font-semibold text-gray-300 mb-3"
              whileHover={{ scale: 1.02 }}
            >
              Descripción de la Necesidad{" "}
              <span className="text-red-500">*</span>
            </motion.label>
            <motion.textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe detalladamente el servicio que necesitas..."
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 resize-none"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Información de Contacto",
      content: (
        <div className="space-y-6">
          <Input
            type="text"
            name="address"
            label="Dirección del Servicio"
            placeholder="Calle 123 #45-67, Ciudad"
            value={formData.address}
            onChange={handleChange}
            required
            icon={
              <motion.svg
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
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
              </motion.svg>
            }
          />

          <Input
            type="text"
            name="contactPerson"
            label="Persona de Contacto"
            placeholder="Nombre completo"
            value={formData.contactPerson}
            onChange={handleChange}
            required
            icon={
              <motion.svg
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
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
              </motion.svg>
            }
          />

          <Input
            type="tel"
            name="contactPhone"
            label="Teléfono de Contacto"
            placeholder="+57 300 123 4567"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            icon={
              <motion.svg
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
              </motion.svg>
            }
          />
        </div>
      ),
    },
    {
      title: "Fecha y Documentos",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              name="suggestedDate"
              label="Fecha Sugerida"
              value={formData.suggestedDate}
              onChange={handleChange}
              required
              icon={
                <motion.svg
                  whileHover={{ rotate: 15 }}
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
                </motion.svg>
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
                <motion.svg
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
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
                </motion.svg>
              }
            />
          </div>

          {/* Documentos o Fotos (Opcional) */}
          <div>
            <motion.label
              className="block text-sm font-semibold text-gray-300 mb-3"
              whileHover={{ scale: 1.02 }}
            >
              Documentos o Fotos (Opcional)
            </motion.label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-gray-700 rounded-lg p-4 sm:p-6 text-center hover:border-primary-500 transition-all duration-300 cursor-pointer group"
            >
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
                <motion.svg
                  whileHover={{ y: -5 }}
                  className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3 group-hover:text-primary-400 transition-colors"
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
                </motion.svg>
                <span className="text-gray-400 text-sm group-hover:text-primary-400 transition-colors">
                  Click para subir archivos o arrastra aquí
                </span>
                <span className="text-gray-500 text-xs mt-1">
                  PDF, DOC, DOCX, Imágenes (Max. 5MB cada uno)
                </span>
              </label>
            </motion.div>

            {/* Lista de archivos seleccionados */}
            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2 overflow-hidden"
                >
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-primary-500 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <motion.svg
                          whileHover={{ scale: 1.2 }}
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
                        </motion.svg>
                        <div>
                          <p className="text-sm text-white">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => removeFile(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
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
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.form
      ref={formRef}
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative mx-4 sm:mx-6 mt-8 mb-12"
    >
      {/* Indicador de progreso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 px-2"
      >
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                    : "bg-gray-700 text-gray-400"
                } ${
                  index === currentStep
                    ? "ring-2 ring-primary-400 ring-offset-2 ring-offset-gray-900"
                    : ""
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {index + 1}
              </motion.div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-16 h-1 mx-2 transition-all duration-300 ${
                    index < currentStep ? "bg-primary-500" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <motion.p
          className="text-center text-gray-400 font-semibold text-sm sm:text-base"
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {steps[currentStep].title}
        </motion.p>
      </motion.div>

      <Card variant="cyber">
        <div className="space-y-6 p-4 sm:p-6">
          {/* Contenido del paso actual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className="p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400 overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <motion.svg
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
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
                  </motion.svg>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones de navegación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-gray-700"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              {currentStep > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={prevStep}
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  }
                >
                  Anterior
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              )}
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={nextStep}
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  icon={
                    <motion.svg
                      animate={loading ? { rotate: 360 } : {}}
                      transition={{
                        duration: 1,
                        repeat: loading ? Infinity : 0,
                        ease: "linear",
                      }}
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
                    </motion.svg>
                  }
                >
                  Enviar Solicitud
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </Card>
    </motion.form>
  );
}
