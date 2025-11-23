import EmployeeOverview from "@/components/dashboard/employee/EmployeeOverview";

export default function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">Mis Servicios</h1>
        <p className="text-gray-400">
          Gestiona tus servicios asignados y completa las tareas
        </p>
      </div>

      {/* Contenido principal */}
      <EmployeeOverview />
    </div>
  );
}
