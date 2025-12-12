import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmployeeProfile from "@/components/dashboard/employee/EmployeeProfile";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || session.user.role !== "EMPLEADO") {
    redirect("/login");
  }

  // Obtener información completa del usuario
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Estadísticas del empleado
  const stats = await prisma.service.groupBy({
    by: ["status"],
    where: {
      employeeId: session.user.id,
    },
    _count: {
      status: true,
    },
  });

  const statsFormatted = {
    assigned: stats.find((s) => s.status === "ASSIGNED")?._count.status || 0,
    inProgress:
      stats.find((s) => s.status === "IN_PROGRESS")?._count.status || 0,
    completed: stats.find((s) => s.status === "COMPLETED")?._count.status || 0,
    total: stats.reduce((acc, curr) => acc + curr._count.status, 0),
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">Mi Perfil</h1>
        <p className="text-gray-400">
          Información personal y estadísticas de rendimiento
        </p>
      </div>

      <EmployeeProfile user={user} stats={statsFormatted} />
    </div>
  );
}
