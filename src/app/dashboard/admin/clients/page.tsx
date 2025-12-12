// app/dashboard/admin/clients/page.tsx
import ClientsList from "@/components/dashboard/admin/ClientsList";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Gestión de Clientes
        </h1>
        <p className="text-gray-400">
          Administra la base de clientes de la plataforma
        </p>
      </div>

      <ClientsList />
    </div>
  );
}
