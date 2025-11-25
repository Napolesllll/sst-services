import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceExecution from "@/components/dashboard/employee/ServiceExecution";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session || session.user.role !== "EMPLEADO") {
    redirect("/login");
  }

  // Await params según Next.js 15
  const { id } = await params;

  // Obtener el servicio con toda la información necesaria
  const service = await prisma.service.findUnique({
    where: {
      id: id,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
      documents: true,
      inspections: true,
      evidences: true,
    },
  });

  // Verificar que el servicio existe
  if (!service) {
    redirect("/dashboard/employee");
  }

  // Verificar que el servicio está asignado a este empleado
  if (service.employeeId !== session.user.id) {
    redirect("/dashboard/employee");
  }

  return (
    <div className="space-y-6">
      <ServiceExecution service={service} userId={session.user.id} />
    </div>
  );
}
