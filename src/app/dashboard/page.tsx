import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Redirigir según el rol del usuario
  switch (session.user.role) {
    case "ADMINISTRADOR":
      redirect("/dashboard/admin");
    case "EMPLEADO":
      redirect("/dashboard/employee");
    case "CLIENTE":
      redirect("/dashboard/client");
    default:
      redirect("/login");
  }
}
