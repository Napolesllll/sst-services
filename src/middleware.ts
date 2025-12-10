import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
    const session = await auth()
    const { pathname } = request.nextUrl

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ["/", "/login", "/register"]
    const isPublicRoute = publicRoutes.includes(pathname)

    // Si no hay sesión y la ruta no es pública, redirigir a login
    if (!session && !isPublicRoute) {
        const loginUrl = new URL("/login", request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Si hay sesión y está en login o register, redirigir al dashboard correspondiente
    if (session && (pathname === "/login" || pathname === "/register")) {
        const dashboardUrl = getDashboardUrl(session.user.role)
        return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    // Protección de rutas por rol
    if (session) {
        const role = session.user.role

        // Rutas del administrador
        if (pathname.startsWith("/dashboard/admin") && role !== "ADMINISTRADOR") {
            const dashboardUrl = getDashboardUrl(role)
            return NextResponse.redirect(new URL(dashboardUrl, request.url))
        }

        // Rutas del empleado
        if (pathname.startsWith("/dashboard/employee") && role !== "EMPLEADO") {
            const dashboardUrl = getDashboardUrl(role)
            return NextResponse.redirect(new URL(dashboardUrl, request.url))
        }

        // Rutas del cliente
        if (pathname.startsWith("/dashboard/client") && role !== "CLIENTE") {
            const dashboardUrl = getDashboardUrl(role)
            return NextResponse.redirect(new URL(dashboardUrl, request.url))
        }
    }

    return NextResponse.next()
}

// Función helper para obtener la URL del dashboard según el rol
function getDashboardUrl(role: string): string {
    switch (role) {
        case "ADMINISTRADOR":
            return "/dashboard/admin"
        case "EMPLEADO":
            return "/dashboard/employee"
        case "CLIENTE":
            return "/dashboard/client"
        default:
            return "/login"
    }
}

// Configuración de rutas que deben pasar por el middleware
export const config = {
    matcher: [
        /**
         * EXCLUIR ARCHIVOS ESTÁTICOS
         * Esto evita que el middleware intercepte imágenes como:
         * - /logo.png
         * - /icon.png
         * - /images/*
         * - /favicon.ico
         * - /_next/*
         * - /public/*
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|public).*)",
    ],
}
