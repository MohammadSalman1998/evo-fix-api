/*
  Warnings:

  - You are about to drop the `Complaints` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Maintenance_Request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Services` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED', 'UNDERPROCESSING', 'DONE', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Complaints" DROP CONSTRAINT "Complaints_userID_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance_Request" DROP CONSTRAINT "Maintenance_Request_technicalID_fkey";

-- DropForeignKey
ALTER TABLE "Maintenance_Request" DROP CONSTRAINT "Maintenance_Request_userID_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_maintenanceRequestID_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_maintenanceRequestID_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_maintenanceRequestID_fkey";

-- DropForeignKey
ALTER TABLE "Reviews" DROP CONSTRAINT "Reviews_userID_fkey";

-- DropForeignKey
ALTER TABLE "SMS" DROP CONSTRAINT "SMS_maintenanceRequestID_fkey";

-- DropTable
DROP TABLE "Complaints";

-- DropTable
DROP TABLE "Maintenance_Request";

-- DropTable
DROP TABLE "Reviews";

-- DropTable
DROP TABLE "Services";

-- DropEnum
DROP TYPE "requestStatus";

-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technician" (
    "id" INTEGER NOT NULL,
    "specialization" TEXT,
    "yearsOfExperience" INTEGER,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" INTEGER NOT NULL,
    "department" TEXT,
    "accessLevel" INTEGER,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "technicalID" INTEGER,
    "governorate" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "phoneNO" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "descProblem" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "maintenanceRequestID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Technician" ADD CONSTRAINT "Technician_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_technicalID_fkey" FOREIGN KEY ("technicalID") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_maintenanceRequestID_fkey" FOREIGN KEY ("maintenanceRequestID") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_maintenanceRequestID_fkey" FOREIGN KEY ("maintenanceRequestID") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_maintenanceRequestID_fkey" FOREIGN KEY ("maintenanceRequestID") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SMS" ADD CONSTRAINT "SMS_maintenanceRequestID_fkey" FOREIGN KEY ("maintenanceRequestID") REFERENCES "MaintenanceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
