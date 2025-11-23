-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'EMPLEADO', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED', 'REOPENED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PROFESIONAL_SST', 'TECNOLOGO_SST', 'TECNICO_SST', 'COORDINADOR_ALTURAS', 'SUPERVISOR_ESPACIOS_CONFINADOS', 'CAPACITACIONES_CURSOS', 'ALQUILER_EQUIPOS', 'ANDAMIERO', 'AUDITORIA_SG_SST', 'RESCATISTA', 'TAPH_PARAMEDICO', 'AUXILIAR_OPERATIVO', 'SERVICIOS_ADMINISTRATIVOS', 'NOMINA', 'FACTURACION', 'CONTRATOS', 'SEGURIDAD_SOCIAL', 'OTRO');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CHARLA_SEGURIDAD', 'ATS', 'PERMISO_TRABAJO', 'PERMISO_ALTURAS', 'PERMISO_ESPACIOS_CONFINADOS', 'PERMISO_TRABAJO_CALIENTE', 'PERMISO_ENERGIAS_PELIGROSAS', 'PERMISO_OTRO');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('ARNES', 'ESLINGA', 'ESCALERA', 'ANDAMIO', 'HERRAMIENTA_TALADRO', 'HERRAMIENTA_PULIDORA', 'MEDICION_GASES', 'TRIPODE', 'LINEA_VIDA', 'VENTILACION', 'EQUIPO_RESCATE', 'CARGA_DOCUMENTOS', 'VALIDACION_SOPORTES', 'FIRMA_DIGITAL', 'CHECKLIST_CUMPLIMIENTO', 'OTRO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "suggestedDate" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "observations" TEXT,
    "clientId" TEXT NOT NULL,
    "employeeId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceAssignment" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceDocument" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "content" JSONB NOT NULL,
    "fileUrl" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceInspection" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "data" JSONB NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "data" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceConfiguration" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "requiredDocs" "DocumentType"[],
    "requiredInspections" "InspectionType"[],
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Service_clientId_idx" ON "Service"("clientId");

-- CreateIndex
CREATE INDEX "Service_employeeId_idx" ON "Service"("employeeId");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_serviceType_idx" ON "Service"("serviceType");

-- CreateIndex
CREATE INDEX "Service_suggestedDate_idx" ON "Service"("suggestedDate");

-- CreateIndex
CREATE INDEX "ServiceAssignment_serviceId_idx" ON "ServiceAssignment"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceAssignment_employeeId_idx" ON "ServiceAssignment"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceAssignment_serviceId_employeeId_key" ON "ServiceAssignment"("serviceId", "employeeId");

-- CreateIndex
CREATE INDEX "ServiceDocument_serviceId_idx" ON "ServiceDocument"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceDocument_documentType_idx" ON "ServiceDocument"("documentType");

-- CreateIndex
CREATE INDEX "ServiceInspection_serviceId_idx" ON "ServiceInspection"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceInspection_inspectionType_idx" ON "ServiceInspection"("inspectionType");

-- CreateIndex
CREATE INDEX "Evidence_serviceId_idx" ON "Evidence"("serviceId");

-- CreateIndex
CREATE INDEX "Evidence_type_idx" ON "Evidence"("type");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceConfiguration_serviceType_key" ON "ServiceConfiguration"("serviceType");

-- CreateIndex
CREATE INDEX "ServiceConfiguration_serviceType_idx" ON "ServiceConfiguration"("serviceType");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_entity_entityId_idx" ON "ActivityLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceAssignment" ADD CONSTRAINT "ServiceAssignment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDocument" ADD CONSTRAINT "ServiceDocument_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceInspection" ADD CONSTRAINT "ServiceInspection_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
