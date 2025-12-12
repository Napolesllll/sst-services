// app/dashboard/admin/employees/page.tsx
import EmployeesList from "../../../../components/dashboard/admin/EmployeesList";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Gestión de Empleados
        </h1>
        <p className="text-gray-400">
          Administra tu equipo de profesionales SST
        </p>
      </div>

      <EmployeesList />
    </div>
  );
}
