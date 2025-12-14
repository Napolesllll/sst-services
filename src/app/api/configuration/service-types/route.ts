// app/api/configuration/service-types/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtener todas las configuraciones
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const configurations = await prisma.serviceConfiguration.findMany({
            orderBy: {
                serviceType: "asc",
            },
        });

        return NextResponse.json({
            configurations,
            total: configurations.length,
        });
    } catch (error) {
        console.error("Error fetching configurations:", error);
        return NextResponse.json(
            { error: "Error al obtener configuraciones" },
            { status: 500 }
        );
    }
}

// POST - Crear o actualizar configuración
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { serviceType, requiredDocs, requiredInspections, description, active } = body;

        // Validaciones
        if (!serviceType) {
            return NextResponse.json(
                { error: "El tipo de servicio es requerido" },
                { status: 400 }
            );
        }

        if (!Array.isArray(requiredDocs)) {
            return NextResponse.json(
                { error: "requiredDocs debe ser un array" },
                { status: 400 }
            );
        }

        if (!Array.isArray(requiredInspections)) {
            return NextResponse.json(
                { error: "requiredInspections debe ser un array" },
                { status: 400 }
            );
        }

        // Upsert (crear o actualizar)
        const configuration = await prisma.serviceConfiguration.upsert({
            where: {
                serviceType: serviceType,
            },
            update: {
                requiredDocs: requiredDocs,
                requiredInspections: requiredInspections,
                description: description || null,
                active: active !== undefined ? active : true,
                updatedAt: new Date(),
            },
            create: {
                serviceType: serviceType,
                requiredDocs: requiredDocs,
                requiredInspections: requiredInspections,
                description: description || null,
                active: active !== undefined ? active : true,
            },
        });

        return NextResponse.json({
            message: "Configuración guardada exitosamente",
            configuration,
        });
    } catch (error) {
        console.error("Error saving configuration:", error);
        return NextResponse.json(
            { error: "Error al guardar configuración" },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar configuración
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMINISTRADOR") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const serviceType = searchParams.get("serviceType");

        if (!serviceType) {
            return NextResponse.json(
                { error: "serviceType es requerido" },
                { status: 400 }
            );
        }

        await prisma.serviceConfiguration.delete({
            where: {
                serviceType: serviceType,
            },
        });

        return NextResponse.json({
            message: "Configuración eliminada exitosamente",
        });
    } catch (error) {
        console.error("Error deleting configuration:", error);
        return NextResponse.json(
            { error: "Error al eliminar configuración" },
            { status: 500 }
        );
    }
}