// src\app\api\maintenance-requests\[id]\assign\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { sendEmail } from "@/lib/email";
import { verifyToken } from "@/utils/verifyToken";

/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id/assign
 *  @desc   Assign a technician to a maintenance request
 *  @access private (technician)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const technician = verifyToken(request);
    if (!technician) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    if (technician.role !== "TECHNICAL") {
      return NextResponse.json({ message: "خاص بالتقني" }, { status: 401 });
    }

    const requestId = parseInt(params.id);

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
        id: requestId,
        status: "PENDING",
      },
      data: {
        technicianId: technician.id,
        status: RequestStatus.ASSIGNED,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            governorate: true,
          },
        },
      },
    });

    const maintenance = {
      RequestID: maintenanceRequest.id,
      deviceType: maintenanceRequest.deviceType,
      problemDescription: maintenanceRequest.problemDescription,
      cost: maintenanceRequest.cost,
      isPaid: maintenanceRequest.isPaid,
      status: maintenanceRequest.status,
      costumerID: maintenanceRequest.user.id,
      costumerName: maintenanceRequest.user.fullName,
      costumerGovernorate: maintenanceRequest.user.governorate,
    };

    // Send email to the user
      await sendEmail({
        subject: "تم تعيين تقني لطلب الصيانة الخاص بك",
        content: `تم تعيين تقني لطلب الصيانة  ${maintenance.deviceType}. سيتم التواصل معك قريبًا.`,
        senderId: technician.id,
        recipientId: maintenance.costumerID,
      });

    // Create notification for the user
    await createNotification({
      userId: maintenanceRequest.customerId,
      content: `تم تعيين تقني لطلب الصيانة  - ${maintenance.deviceType}`,
    });

    return NextResponse.json({
      message: "تم تعيين التقني بنجاح",
      request: maintenance,
    });
  } catch (error) {
    console.error("Error assigning technician", error);
    return NextResponse.json({ message: "خطأ من الخادم أم أن الطلب غير متاح" }, { status: 500 | 401 });
  }
}
