import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmployeeDocuments from "@/components/dashboard/employee/EmployeeDocuments";

export default async function DocumentsPage() {
  const session = await auth();

  if (!session || session.user.role !== "EMPLEADO") {
    redirect("/login");
  }

  // Obtener todos los documentos generados por el empleado
  const documents = await prisma.serviceDocument.findMany({
    where: {
      service: {
        employeeId: session.user.id,
      },
    },
    include: {
      service: {
        select: {
          id: true,
          serviceType: true,
          empresaContratante: true,
          municipio: true,
          status: true,
          client: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Estadísticas
  const stats = {
    total: documents.length,
    completed: documents.filter((d) => d.completedAt).length,
    pending: documents.filter((d) => !d.completedAt).length,
    byType: documents.reduce((acc, doc) => {
      acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Mis Documentos
        </h1>
        <p className="text-gray-400">
          Documentos generados en servicios - Total: {documents.length}
        </p>
      </div>

      <EmployeeDocuments documents={documents} stats={stats} />
    </div>
  );
}
