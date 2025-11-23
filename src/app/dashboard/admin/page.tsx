import AdminOverview from "@/components/dashboard/admin/AdminOverview";
import AdminStats from "@/components/dashboard/admin/AdminStats";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-400">
          Gestiona servicios, empleados y toda la operación
        </p>
      </div>

      {/* Estadísticas */}
      <AdminStats />

      {/* Contenido principal */}
      <AdminOverview />
    </div>
  );
}
