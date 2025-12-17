-- AlterTable
ALTER TABLE "ServiceDocument" ADD COLUMN     "instanceNumber" INTEGER,
ADD COLUMN     "isGroupDocument" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentDocumentId" TEXT;

-- CreateIndex
CREATE INDEX "ServiceDocument_parentDocumentId_idx" ON "ServiceDocument"("parentDocumentId");

-- CreateIndex
CREATE INDEX "ServiceDocument_serviceId_documentType_idx" ON "ServiceDocument"("serviceId", "documentType");

-- CreateIndex
CREATE INDEX "ServiceDocument_isGroupDocument_idx" ON "ServiceDocument"("isGroupDocument");

-- AddForeignKey
ALTER TABLE "ServiceDocument" ADD CONSTRAINT "ServiceDocument_parentDocumentId_fkey" FOREIGN KEY ("parentDocumentId") REFERENCES "ServiceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
