// src\lib\accounts.ts

import prisma from "@/utils/db";

export async function getAllTechnician() {
  try {
    const allTechnician = await prisma.user.findMany({
      where: { role: "TECHNICAL" },
      select: {
        fullName: true,
        email: true,
        address: true,
        governorate: true,
        role: true,
        phoneNO: true,
        isActive: true,
        technician: {
          select: {
            services: true,
            specialization: true,
          },
        },
        maintenanceRequests: {
          select: {
            deviceImage: true,
            deviceModel: true,
            deviceType: true,
            problemDescription: true,
            status: true,
            cost: true,
            isPaid: true,
            isPaidCheckFee: true,
          },
        },
        createdAt: true,
      },
    });

    return allTechnician;
  } catch (error) {
    console.error("Error get all Technician:", error);
    throw new Error("Failed to get all Technician");
  }
}

export async function getAllTechnicianByGovernorate(governorate: string) {
  try {
    const TechnicianByGovernorate = await prisma.user.findMany({
      where: { role: "TECHNICAL", governorate },
      select: {
        fullName: true,
        email: true,
        address: true,
        governorate: true,
        role: true,
        phoneNO: true,
        isActive: true,
        technician: {
          select: {
            services: true,
            specialization: true,
          },
        },
        maintenanceRequests: {
          select: {
            deviceImage: true,
            deviceModel: true,
            deviceType: true,
            problemDescription: true,
            status: true,
            cost: true,
            isPaid: true,
            isPaidCheckFee: true,
          },
        },
        createdAt: true,
      },
    });

    return TechnicianByGovernorate;
  } catch (error) {
    console.error("Error get all Technician By Governorate:", error);
    throw new Error("Failed to get all Technician By Governorate");
  }
}


export async function getAllSubAdmin() {
    try {
      const allSubAdmin = await prisma.user.findMany({
        where: { role: "SUBADMIN" },
        select: {
          fullName: true,
          email: true,
          address: true,
          governorate: true,
          role: true,
          phoneNO: true,
          isActive: true,
          subadmin: {
            select: {
              department:true,
              governorate:true
            },
          },
          createdAt: true,
        },
      });
  
      return allSubAdmin;
    } catch (error) {
      console.error("Error get all SubAdmin:", error);
      throw new Error("Failed to get all SubAdmin");
    }
  }
