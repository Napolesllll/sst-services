import ClientOverview from "@/components/dashboard/client/ClientOverview";

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Mis Solicitudes
        </h1>
        <p className="text-gray-400">
          Solicita servicios y revisa el estado de tus peticiones
        </p>
      </div>

      {/* Contenido principal */}
      <ClientOverview />
    </div>
  );
}
