// app/dashboard/admin/services/page.tsx
import ServicesList from "../../../../components/dashboard/admin/ServicesList";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Todos los Servicios
        </h1>
        <p className="text-gray-400">
          Gestiona todos los servicios de la plataforma
        </p>
      </div>

      <ServicesList />
    </div>
  );
}
