"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// Tipos de servicio según Google Form
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
  {
    value: "SERVICIOS_ADMINISTRATIVOS",
    label:
      "Servicios Administrativos (Nómina, Facturación, Contratos, Seguridad Social)",
  },
];

export default function ServiceRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    // Paso 1: Información de la Empresa
    empresaContratante: "",
    personaSolicita: "",
    serviceType: "",
    cantidadRequerida: "",

    // Paso 2: Descripción del Servicio
    description: "",
    equiposUtilizar: "",
    herramientasUtilizar: "",
    maquinasUtilizar: "",
    numeroTrabajadores: "",

    // Paso 3: Ubicación
    municipio: "",
    address: "",
    empresaPrestacionServicio: "",

    // Paso 4: Fechas y Horarios
    fechaInicio: "",
    fechaTerminacion: "",
    horarioEjecucion: "",

    // Paso 5: Información de Contacto
    contactPerson: "",
    contactPhone: "",
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
    // Limpiar error al cambiar campos
    if (error) setError("");
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

  const validateCurrentStep = (): boolean => {
    setError("");

    switch (currentStep) {
      case 0: // Información de la Empresa
        if (!formData.empresaContratante.trim()) {
          setError("La empresa contratante es requerida");
          return false;
        }
        if (!formData.personaSolicita.trim()) {
          setError("La persona quien solicita es requerida");
          return false;
        }
        if (!formData.serviceType) {
          setError("Debes seleccionar un tipo de servicio");
          return false;
        }
        if (
          !formData.cantidadRequerida ||
          parseInt(formData.cantidadRequerida) <= 0
        ) {
          setError("La cantidad requerida debe ser mayor a 0");
          return false;
        }
        break;

      case 1: // Descripción del Servicio
        if (!formData.description.trim()) {
          setError("La descripción es requerida");
          return false;
        }
        if (!formData.equiposUtilizar.trim()) {
          setError("La descripción de equipos es requerida");
          return false;
        }
        if (!formData.herramientasUtilizar.trim()) {
          setError("La descripción de herramientas es requerida");
          return false;
        }
        if (!formData.maquinasUtilizar.trim()) {
          setError("La descripción de máquinas es requerida");
          return false;
        }
        if (
          !formData.numeroTrabajadores ||
          parseInt(formData.numeroTrabajadores) <= 0
        ) {
          setError("El número de trabajadores debe ser mayor a 0");
          return false;
        }
        break;

      case 2: // Ubicación
        if (!formData.municipio.trim()) {
          setError("El municipio es requerido");
          return false;
        }
        if (!formData.empresaPrestacionServicio.trim()) {
          setError("La empresa donde se prestará el servicio es requerida");
          return false;
        }
        break;

      case 3: // Fechas y Horarios
        if (!formData.fechaInicio) {
          setError("La fecha de inicio es requerida");
          return false;
        }
        if (!formData.fechaTerminacion) {
          setError("La fecha de terminación es requerida");
          return false;
        }
        const inicio = new Date(formData.fechaInicio);
        const fin = new Date(formData.fechaTerminacion);
        if (fin < inicio) {
          setError(
            "La fecha de terminación debe ser posterior a la fecha de inicio"
          );
          return false;
        }
        if (!formData.horarioEjecucion.trim()) {
          setError("El horario de ejecución es requerido");
          return false;
        }
        break;

      case 4: // Información de Contacto
        if (!formData.contactPerson.trim()) {
          setError("El nombre del coordinador es requerido");
          return false;
        }
        if (!formData.contactPhone.trim()) {
          setError("El teléfono del coordinador es requerido");
          return false;
        }
        break;
    }

    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateAllSteps = (): boolean => {
    // Validar todos los pasos antes de enviar
    for (let step = 0; step < 5; step++) {
      setError("");

      switch (step) {
        case 0: // Información de la Empresa
          if (!formData.empresaContratante.trim()) {
            setError("La empresa contratante es requerida");
            return false;
          }
          if (!formData.personaSolicita.trim()) {
            setError("La persona quien solicita es requerida");
            return false;
          }
          if (!formData.serviceType) {
            setError("Debes seleccionar un tipo de servicio");
            return false;
          }
          if (
            !formData.cantidadRequerida ||
            parseInt(formData.cantidadRequerida) <= 0
          ) {
            setError("La cantidad requerida debe ser mayor a 0");
            return false;
          }
          break;

        case 1: // Descripción del Servicio
          if (!formData.description.trim()) {
            setError("La descripción es requerida");
            return false;
          }
          if (!formData.equiposUtilizar.trim()) {
            setError("La descripción de equipos es requerida");
            return false;
          }
          if (!formData.herramientasUtilizar.trim()) {
            setError("La descripción de herramientas es requerida");
            return false;
          }
          if (!formData.maquinasUtilizar.trim()) {
            setError("La descripción de máquinas es requerida");
            return false;
          }
          if (
            !formData.numeroTrabajadores ||
            parseInt(formData.numeroTrabajadores) <= 0
          ) {
            setError("El número de trabajadores debe ser mayor a 0");
            return false;
          }
          break;

        case 2: // Ubicación
          if (!formData.municipio.trim()) {
            setError("El municipio es requerido");
            return false;
          }
          if (!formData.empresaPrestacionServicio.trim()) {
            setError("La empresa donde se prestará el servicio es requerida");
            return false;
          }
          break;

        case 3: // Fechas y Horarios
          if (!formData.fechaInicio) {
            setError("La fecha de inicio es requerida");
            return false;
          }
          if (!formData.fechaTerminacion) {
            setError("La fecha de terminación es requerida");
            return false;
          }
          const inicio = new Date(formData.fechaInicio);
          const fin = new Date(formData.fechaTerminacion);
          if (fin < inicio) {
            setError(
              "La fecha de terminación debe ser posterior a la fecha de inicio"
            );
            return false;
          }
          if (!formData.horarioEjecucion.trim()) {
            setError("El horario de ejecución es requerido");
            return false;
          }
          break;

        case 4: // Información de Contacto
          if (!formData.contactPerson.trim()) {
            setError("El nombre del coordinador es requerido");
            return false;
          }
          if (!formData.contactPhone.trim()) {
            setError("El teléfono del coordinador es requerido");
            return false;
          }
          break;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los pasos
    if (!validateAllSteps()) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Preparar datos para enviar
      const requestData = {
        empresaContratante: formData.empresaContratante.trim(),
        personaSolicita: formData.personaSolicita.trim(),
        serviceType: formData.serviceType,
        cantidadRequerida: parseInt(formData.cantidadRequerida),
        description: formData.description.trim(),
        equiposUtilizar: formData.equiposUtilizar.trim(),
        herramientasUtilizar: formData.herramientasUtilizar.trim(),
        maquinasUtilizar: formData.maquinasUtilizar.trim(),
        numeroTrabajadores: parseInt(formData.numeroTrabajadores),
        municipio: formData.municipio.trim(),
        address: formData.address.trim() || null,
        empresaPrestacionServicio: formData.empresaPrestacionServicio.trim(),
        fechaInicio: formData.fechaInicio,
        fechaTerminacion: formData.fechaTerminacion,
        horarioEjecucion: formData.horarioEjecucion.trim(),
        contactPerson: formData.contactPerson.trim(),
        contactPhone: formData.contactPhone.trim(),
      };

      console.log("Enviando solicitud:", requestData);

      // 🔥 AQUÍ ESTÁ LA CORRECCIÓN: Hacer la llamada real al API
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

      console.log("Solicitud creada exitosamente:", data);
      setSuccess(true);

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push("/dashboard/client");
      }, 3000);
    } catch (err: any) {
      console.error("Error al enviar solicitud:", err);
      setError(
        err.message ||
          "Error al crear la solicitud. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-4 bg-gray-900"
      >
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 mb-6 mx-auto shadow-2xl"
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
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4 text-center">
            ¡Solicitud Creada Exitosamente!
          </h2>

          <p className="text-gray-400 text-center mb-8">
            Nuestro equipo revisará tu solicitud y asignará un profesional
            calificado en breve. Serás redirigido al dashboard...
          </p>

          <button
            onClick={() => router.push("/dashboard/client")}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all"
          >
            Ir al Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const steps = [
    {
      title: "Información de la Empresa",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Empresa Contratante <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="empresaContratante"
              value={formData.empresaContratante}
              onChange={handleChange}
              required
              placeholder="Nombre de la empresa"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Persona quien Solicita <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="personaSolicita"
              value={formData.personaSolicita}
              onChange={handleChange}
              required
              placeholder="Nombre completo"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Tipo de Servicio <span className="text-red-500">*</span>
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Selecciona un servicio...</option>
              {SERVICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Cantidad Requerida <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cantidadRequerida"
              value={formData.cantidadRequerida}
              onChange={handleChange}
              required
              min="1"
              placeholder="Ej: 2"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-xs text-gray-500 mt-1">
              Especificar la cantidad de servicio o persona requerida
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Descripción del Servicio",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Descripción del Servicio <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Especifique detalladamente la forma como se desarrollarán las actividades"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Describir Equipos a Utilizar{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="equiposUtilizar"
              value={formData.equiposUtilizar}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Favor describir detalladamente los equipos a utilizar"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Describir Herramientas a Utilizar{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="herramientasUtilizar"
              value={formData.herramientasUtilizar}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Favor describir detalladamente las herramientas a utilizar"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Describir Máquinas a Utilizar{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              name="maquinasUtilizar"
              value={formData.maquinasUtilizar}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Favor describir detalladamente las máquinas a utilizar"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Número de Trabajadores <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="numeroTrabajadores"
              value={formData.numeroTrabajadores}
              onChange={handleChange}
              required
              min="1"
              placeholder="Cantidad de trabajadores en obra"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Ubicación",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Municipio <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              required
              placeholder="Ciudad o municipio"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Dirección Detallada
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Calle 123 #45-67"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-xs text-gray-500 mt-1">
              Favor colocar la dirección completa donde se prestará el servicio
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nombre de Empresa donde se Prestará Servicio{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="empresaPrestacionServicio"
              value={formData.empresaPrestacionServicio}
              onChange={handleChange}
              required
              placeholder="Nombre de la empresa y puntos de referencia"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Fechas y Horarios",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Fecha Probable de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Fecha Probable de Terminación{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fechaTerminacion"
              value={formData.fechaTerminacion}
              onChange={handleChange}
              required
              min={
                formData.fechaInicio || new Date().toISOString().split("T")[0]
              }
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Horario de Ejecución <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="horarioEjecucion"
              value={formData.horarioEjecucion}
              onChange={handleChange}
              required
              placeholder="Ej: 07:00 - 17:00"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-xs text-gray-500 mt-1">
              Colocar el horario en formato 24 horas
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Información de Contacto",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Nombre del Coordinador de la Actividad{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              required
              placeholder="Nombre del contacto"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Teléfono del Coordinador de la Actividad{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              placeholder="+57 300 123 4567"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Documentos",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Documentos o Fotos (Opcional)
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-all cursor-pointer">
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
                  className="w-16 h-16 text-gray-400 mb-3"
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
                  Click para subir archivos
                </span>
                <span className="text-gray-500 text-xs mt-1">
                  PDF, DOC, DOCX, Imágenes
                </span>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-blue-400"
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
                      className="text-red-400 hover:text-red-300"
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
        </div>
      ),
    },
  ];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      className="min-h-screen bg-gray-900 py-8 px-4"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            SOLICITUD DE SERVICIO SST
          </h1>
          <p className="text-gray-400">
            Por favor diligenciar formulario de solicitud, datos concretos y
            puntuales.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    index <= currentStep
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      index < currentStep ? "bg-blue-500" : "bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 font-semibold text-sm">
            {steps[currentStep].title}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-400"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
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
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={
                currentStep > 0
                  ? prevStep
                  : () => router.push("/dashboard/client")
              }
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep > 0 ? "Anterior" : "Cancelar"}
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  "Enviar Solicitud"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.form>
  );
}
