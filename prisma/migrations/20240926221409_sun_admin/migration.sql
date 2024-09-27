/*
  Warnings:

  - You are about to drop the column `accessLevel` on the `SUBADMIN` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SUBADMIN" DROP COLUMN "accessLevel",
ADD COLUMN     "governorate" TEXT;
