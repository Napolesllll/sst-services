-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "configuredAt" TIMESTAMP(3),
ADD COLUMN     "configuredById" TEXT,
ADD COLUMN     "requiredDocs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requiredInspections" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_configuredById_fkey" FOREIGN KEY ("configuredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
