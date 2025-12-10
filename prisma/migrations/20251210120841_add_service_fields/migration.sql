/*
  Warnings:

  - Added the required column `cantidadRequerida` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaContratante` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `empresaPrestacionServicio` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equiposUtilizar` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaInicio` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaTerminacion` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `herramientasUtilizar` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horarioEjecucion` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maquinasUtilizar` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipio` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroTrabajadores` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personaSolicita` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "cantidadRequerida" INTEGER NOT NULL,
ADD COLUMN     "empresaContratante" TEXT NOT NULL,
ADD COLUMN     "empresaPrestacionServicio" TEXT NOT NULL,
ADD COLUMN     "equiposUtilizar" TEXT NOT NULL,
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaTerminacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "herramientasUtilizar" TEXT NOT NULL,
ADD COLUMN     "horarioEjecucion" TEXT NOT NULL,
ADD COLUMN     "maquinasUtilizar" TEXT NOT NULL,
ADD COLUMN     "municipio" TEXT NOT NULL,
ADD COLUMN     "numeroTrabajadores" INTEGER NOT NULL,
ADD COLUMN     "personaSolicita" TEXT NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Service_municipio_idx" ON "Service"("municipio");
