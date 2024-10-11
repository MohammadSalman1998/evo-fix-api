// src\app\api\maintenance-requests\[id]\assign\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { sendEmail, sendRealMail } from "@/lib/email";
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
        { status: 403 }
      );
    }

    if (technician.role !== "TECHNICAL") {
      return NextResponse.json({ message: "خاص بالتقني" }, { status: 403 });
    }

    const requestId = parseInt(params.id);

    const maintenance = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      include: {
        technician: {
          select: {
            user: {
              select: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!maintenance) {
      return NextResponse.json(
        { message: "هذا الطلب غير متاح" },
        { status: 404 }
      );
    }

    if (
      technician.id !== maintenance?.technicianId ||
      !maintenance.technician?.user.isActive
    ) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 403 }
      );
    }

    if(maintenance.status === "ASSIGNED"){
      return NextResponse.json(
        { message: "هذا الطلب تم استلامه بالفعل" },
        { status: 400 }
      );
    }

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
            email: true,
          },
        },
      },
    });

    const maintenanceData = {
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
      content: `تم تعيين تقني لطلب الصيانة  ${maintenanceData.deviceType}. سيتم التواصل معك قريبًا.`,
      senderId: technician.id,
      recipientId: maintenanceData.costumerID,
    });

    // Create notification for the user
    await createNotification({
      recipientId: maintenanceRequest.customerId,
      senderId: technician.id,
      title: "استلام الطلب",
      content: `تم تعيين تقني لطلب الصيانة  - ${maintenanceData.deviceType}`,
    });

    await sendRealMail({
      to: maintenanceRequest.user.email,
      subject: " استلام طلب صيانة",
      html: ` <div dir="rtl">
  <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
  <h1>سيد/ة ${maintenanceRequest.user.fullName}</h1>
  <h3> لقد تم تعيين تقني لطلب الصيانة ${maintenanceData.deviceType} </h3>
  <h2>سيتم إرسال الفريق التقني الى العنوان المحدد </h2>
  <b>${maintenanceRequest.address}</b>
  <b>ومن ثم سيتم تعيين وإرسال التكلفة قبل البدء</b>
</div>`,
    });

    return NextResponse.json({
      message: "تم تعيين التقني بنجاح",
      request: maintenanceData,
    });
  } catch (error) {
    console.error("Error assigning technician", error);
    return NextResponse.json(
      { message: "خطأ من الخادم " },
      { status: 500 }
    );
  }
}
