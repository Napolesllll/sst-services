import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import DashboardHeader from "@/components/shared/DashboardHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMINISTRADOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <DashboardHeader user={session.user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64 mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
