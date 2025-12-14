// app/api/configuration/required-documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getRequiredDocuments, getRequiredInspections } from "@/lib/serviceDocuments";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceType = searchParams.get("serviceType");

        if (!serviceType) {
            return NextResponse.json(
                { error: "serviceType es requerido" },
                { status: 400 }
            );
        }

        // Obtener documentos e inspecciones requeridos
        const requiredDocuments = await getRequiredDocuments(serviceType);
        const requiredInspections = await getRequiredInspections(serviceType);

        return NextResponse.json({
            serviceType,
            requiredDocuments,
            requiredInspections,
            totalRequired: requiredDocuments.length + requiredInspections.length,
        });
    } catch (error) {
        console.error("Error fetching required documents:", error);
        return NextResponse.json(
            { error: "Error al obtener documentos requeridos" },
            { status: 500 }
        );
    }
}