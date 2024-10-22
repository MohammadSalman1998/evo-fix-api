// src\lib\requests.ts
import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { UpdateMaintenance_RequestDto } from "@/utils/dtos";
import dayjs from 'dayjs';


export async function PendingRequests() {
  try {
    const countRequest = await prisma.maintenanceRequest.count({
      where: { status: "PENDING" },
    });

    if (countRequest < 1) {
      return { message: "لا يوجد طلبات حاليا" };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        governorate: true,
        deviceType: true,
        problemDescription: true,
        deviceModel: true,
        deviceImage: true,
        isPaid: true,
        isPaidCheckFee: true,
        cost: true,
        status: true,
        createdAt: true,
      },
      orderBy:{createdAt:"desc"}
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests;
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    throw new Error("Failed");
  }
}

export async function Requests(TechID: number, statusRequest: RequestStatus) {
  try {
    const countRequest = await prisma.maintenanceRequest.count({
      where: {
        status: statusRequest,
        technicianId: TechID,
      },
    });

    if (countRequest < 1) {
      return { message: "لا توجد طلبات متاحة" };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: statusRequest, technicianId: TechID },
      select: {
        id: true,
        governorate: true,
        deviceType: true,
        deviceModel: true,
        deviceImage: true,
        problemDescription: true,
        isPaid: true,
        isPaidCheckFee: true,
        cost: true,
        status: true,
        createdAt: true,
        technician:{
          select:{
            user:true
          }
        }
      },
      orderBy:{createdAt:"desc"}
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests;
  } catch (error) {
    console.error("Error fetching  maintenance requests", error);
    throw new Error("خطأ من الخادم");
  }
}

export async function QuotedRequests() {
  try {
    const countRequest = await prisma.maintenanceRequest.count({
      where: { status: "QUOTED" },
    });

    if (countRequest < 1) {
      return NextResponse.json(
        { message: "لا يوجد طلبات حاليا" },
        { status: 400 }
      );
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: "QUOTED" },
      select: {
        id: true,
        governorate: true,
        deviceType: true,
        problemDescription: true,
        deviceModel: true,
        deviceImage: true,
        isPaid: true,
        isPaidCheckFee: true,
        cost: true,
        status: true,
        createdAt: true,
      },
      orderBy:{createdAt:"desc"}
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

export async function InProgressRequests() {
  try {
    const countRequest = await prisma.maintenanceRequest.count({
      where: { status: "IN_PROGRESS" },
    });

    if (countRequest < 1) {
      return NextResponse.json(
        { message: "لا يوجد طلبات حاليا" },
        { status: 400 }
      );
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: "IN_PROGRESS" },
      select: {
        id: true,
        governorate: true,
        deviceType: true,
        problemDescription: true,
        deviceModel: true,
        deviceImage: true,
        isPaid: true,
        isPaidCheckFee: true,
        cost: true,
        status: true,
        createdAt: true,
      },
      orderBy:{createdAt:"desc"}
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

export async function RejectedRequests() {
  try {
    const countRequest = await prisma.maintenanceRequest.count({
      where: { status: "REJECTED" },
    });

    if (countRequest < 1) {
      return NextResponse.json(
        { message: "لا يوجد طلبات حاليا" },
        { status: 400 }
      );
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: "REJECTED" },
      select: {
        id: true,
        governorate: true,
        deviceType: true,
        problemDescription: true,
        deviceModel: true,
        deviceImage: true,
        isPaid: true,
        isPaidCheckFee: true,
        cost: true,
        status: true,
        createdAt: true,
      },
      orderBy:{createdAt:"desc"}
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

export async function CompletedRequests() {
  try {
    const countRequest = await prisma.maintenanceRequest.count({
      where: { status: "COMPLETED" },
    });

    if (countRequest < 1) {
      return NextResponse.json(
        { message: "لا يوجد طلبات حاليا" },
        { status: 400 }
      );
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: "COMPLETED" },
      select: {
        id: true,
        governorate: true,
        deviceType: true,
        problemDescription: true,
        deviceModel: true,
        deviceImage: true,
        isPaid: true,
        isPaidCheckFee: true,
        cost: true,
        status: true,
        createdAt: true,
      },
      orderBy:{createdAt:"desc"}
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

export async function AllTechTasks(TechID: number) {
  try {
    const countRequest = await prisma.maintenanceRequest.count({
      where: { technicianId: TechID },
    });

    if (countRequest < 1) {
      return { message: "لا توجد مهام متاحة" };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { technicianId: TechID },
      select: {
        id: true,
        governorate: true,
        deviceType: true,
        deviceModel: true,
        deviceImage: true,
        problemDescription: true,
        status: true,
        cost: true,
        isPaid: true,
        isPaidCheckFee: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests;
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    throw new Error("Failed");
  }
}

export async function AllRequests() {
  try {
    const countRequest = await prisma.maintenanceRequest.count();

    if (countRequest < 1) {
      return { message: "لا توجد طلبات متاحة" };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            phoneNO: true,
            email: true,
            governorate: true,
            address: true,
          },
        },
        technician: {
          select: {
            user: {
              select: {
                fullName: true,
                phoneNO: true,
                email: true,
                governorate: true,
                address: true,
              },
            },
            specialization: true,
            services: true,
          },
        },
        governorate: true,
        deviceType: true,
        deviceModel: true,
        deviceImage: true,
        problemDescription: true,
        status: true,
        cost: true,
        isPaid: true,
        isPaidCheckFee: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests;
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    throw new Error("Failed");
  }
}

export async function AllRequestsByGovernorate(governorate: string) {
  try {
    const countRequest = await prisma.maintenanceRequest.count();

    if (countRequest < 1) {
      return { message: "لا توجد طلبات متاحة" };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { governorate: governorate },
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            phoneNO: true,
            email: true,
            governorate: true,
            address: true,
          },
        },
        technician: {
          select: {
            user: {
              select: {
                fullName: true,
                phoneNO: true,
                email: true,
                governorate: true,
                address: true,
              },
            },
            specialization: true,
            services: true,
          },
        },
        governorate: true,
        deviceType: true,
        deviceModel: true,
        deviceImage: true,
        problemDescription: true,
        status: true,
        cost: true,
        isPaid: true,
        isPaidCheckFee: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests;
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    throw new Error("Failed");
  }
}

export async function AllUserRequests(userID: number) {
  try {
    const countRequest = await prisma.maintenanceRequest.count();

    if (countRequest < 1) {
      return { message: "لا توجد طلبات متاحة" };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { customerId: userID },
      select: {
        id: true,
        user: {
          select: {
            fullName: true,
            phoneNO: true,
            email: true,
            governorate: true,
            address: true,
          },
        },
        governorate: true,
        deviceType: true,
        deviceModel: true,
        deviceImage: true,
        problemDescription: true,
        status: true,
        cost: true,
        isPaid: true,
        isPaidCheckFee: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const formattedRequests = requests.map(request => ({
      ...request,
      createdAt: dayjs(request.createdAt).format('YYYY-MM-DD HH:mm'),
    }));
    return formattedRequests;
  } catch (error) {
    console.error("Error fetching all maintenance requests", error);
    throw new Error("Failed");
  }
}

export async function editActiveIsPaid(id: number) {
  try {
    const activePaid = await prisma.maintenanceRequest.update({
      where: { id: id },
      data: {
        isPaid: true,
      },
    });
    return activePaid;
  } catch (error) {
    console.log("error edit active of ePaid", error);
    throw new Error("error edit active of ePaid");
  }
}

export async function editActiveIsPaidOfCheck(id: number) {
  try {
    const activecheckPaid = await prisma.maintenanceRequest.update({
      where: { id: id },
      data: {
        isPaidCheckFee: true,
      },
    });
    return activecheckPaid;
  } catch (error) {
    console.log("error edit active of Check Paid", error);
    throw new Error("error edit active of Check Paid");
  }
}

export async function updateRequest(
  id: number,
  {
    deviceType,
    deviceModel,
    governorate,
    phoneNO,
    address,
    problemDescription,
    status,
    cost,
    resultCheck,
    isPaid,
    isPaidCheckFee,
  }: UpdateMaintenance_RequestDto
) {
  try {
    const updateRequest = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        deviceType,
        deviceModel,
        governorate,
        phoneNO,
        address,
        problemDescription,
        status,
        cost,
        resultCheck,
        isPaid,
        isPaidCheckFee,
      },
    });
    return updateRequest
  } catch (error) {
    console.log("error update request maintenance", error);
    throw new Error("error update request maintenance");
  }
}
