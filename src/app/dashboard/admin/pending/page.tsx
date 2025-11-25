import PendingServicesList from "@/components/dashboard/admin/PendingServicesList";

export default function PendingServicesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Solicitudes Pendientes
        </h1>
        <p className="text-gray-400">
          Asigna empleados calificados a las solicitudes de servicio
        </p>
      </div>

      <PendingServicesList />
    </div>
  );
}
