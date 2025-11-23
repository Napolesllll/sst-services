import ServiceRequestForm from "@/components/dashboard/client/ServiceRequestForm";

export default function NewRequestPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Nueva Solicitud de Servicio
        </h1>
        <p className="text-gray-400">
          Completa el formulario y nuestro equipo asignará un profesional
          calificado
        </p>
      </div>

      <ServiceRequestForm />
    </div>
  );
}
