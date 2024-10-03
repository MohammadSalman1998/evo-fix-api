// src\app\api\maintenance-requests\route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/utils/db";
// import { Role, RequestStatus } from '@prisma/client';
import { Role } from '@prisma/client';
// import { sendEmail } from '@/lib/email';
import { createNotification } from '@/lib/notification';
import { MaintenanceRequestSchema } from '@/utils/validationSchemas';
import { verifyToken } from "@/utils/verifyToken";
import { CreateMaintenance_RequestDto } from '@/utils/dtos';


/**
 *  @method POST
 *  @route  ~/api/maintenance-requests
 *  @desc   Create a new maintenance request + create notifications for all Technicians
 *  @access public (user)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 401 },
      );
    }
    const body = await request.json() as CreateMaintenance_RequestDto;
    // Assume we have a validation schema
    const validation = MaintenanceRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        customerId: user.id,
        governorate: body.governorate,
        phoneNO: body.phoneNO,
        address: body.address,
        deviceType: body.deviceType,
        problemDescription: body.problemDescription,
      },
    });

    // Send notification to all technicians
    const technicians = await prisma.user.findMany({
      where: { role: Role.TECHNICAL },
    });

    for (const technician of technicians) {
      await createNotification({
        userId: technician.id,
        content: `طلب صيانة جديد: ${newRequest.deviceType}`,
      });
    }

    return NextResponse.json({ message: "تم إنشاء طلب الصيانة بنجاح", request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance request", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests
 *  @desc  Get All Maintenance Requests 
 *  @access Private only
 */