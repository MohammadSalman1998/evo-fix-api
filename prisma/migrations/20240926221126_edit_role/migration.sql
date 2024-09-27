/*
  Warnings:

  - You are about to drop the column `yearsOfExperience` on the `Technician` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUBADMIN';

-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_id_fkey";

-- AlterTable
ALTER TABLE "Technician" DROP COLUMN "yearsOfExperience",
ADD COLUMN     "services" TEXT;

-- DropTable
DROP TABLE "Admin";

-- CreateTable
CREATE TABLE "SUBADMIN" (
    "id" INTEGER NOT NULL,
    "department" TEXT,
    "accessLevel" INTEGER,

    CONSTRAINT "SUBADMIN_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SUBADMIN" ADD CONSTRAINT "SUBADMIN_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
