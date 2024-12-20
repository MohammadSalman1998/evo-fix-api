// src\app\api\maintenance-requests\[id]\reject\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendRealMail } from "@/lib/email";

/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id/reject
 *  @desc   Reject the cost quote for a maintenance request
 *  @access private (user)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.id);
    const maintenance = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            isActive: true,
            email: true,
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

    if (user.id !== maintenance?.customerId || !maintenance.user.isActive) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 403 }
      );
    }

    if (maintenance.status === "REJECTED") {
      return NextResponse.json(
        { message: "هذا الطلب تم رفضه بالفعل" },
        { status: 400 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
        id: requestId,
        OR: [{ status: "QUOTED" }, { status: "ASSIGNED" }],
      },
      data: {
        status: RequestStatus.REJECTED,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            governorate: true,
          },
        },
        technician: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true,
                governorate: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const maintenanceData = {
      RequestID: maintenanceRequest.id,
      deviceType: maintenanceRequest.deviceType,
      deviceModel: maintenanceRequest.deviceModel,
      problemDescription: maintenanceRequest.problemDescription,
      cost: maintenanceRequest.cost,
      isPaid: maintenanceRequest.isPaid,
      isPaidCheckFee: maintenanceRequest.isPaidCheckFee,
      status: maintenanceRequest.status,
      costumerID: maintenanceRequest.user.id,
      costumerName: maintenanceRequest.user.fullName,
      costumerGovernorate: maintenanceRequest.user.governorate,
    };

    if (user.id !== maintenanceRequest.customerId) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 401 }
      );
    }

    // Send email to the technician
    if (maintenanceRequest.technician && maintenanceRequest.technician.user) {
      // Create notification for the technician
      await createNotification({
        recipientId: maintenanceRequest.technician?.user.id,
        senderId: user.id,
        title: "رفض تكلفة الطلب",
        content: `تم رفض عرض السعر لطلب الصيانة - ${maintenanceData.deviceType} يمكنك إعادة القطعة`,
        requestId: maintenanceRequest.id,
      });

      await sendRealMail(
        {
          recipientName: maintenanceRequest.technician.user.fullName,
          mainContent: `لقد تم رفض تكلفة طلب الصيانة ${maintenanceData.deviceType}`,
          additionalContent: `يمكنك إعادة القطعة إلى العنوان التالي "${maintenanceRequest.address}"`,
        },
        {
          to: maintenanceRequest.technician.user.email,
          subject: " رفض تكلفة طلب صيانة",
        }
      );
    }

    await createNotification({
      recipientId: user.id,
      senderId: user.id,
      title: "رفض تكلفة الطلب",
      content: `تم رفض عرض السعر لطلب الصيانة - ${maintenanceData.deviceType} نتمنى أن تراسلنا لمعرفة السبب`,
      requestId: maintenanceRequest.id,
    });

    await sendRealMail(
      {
        recipientName: user.fullName,
        mainContent: `لقد تم رفض تكلفة طلب الصيانة ${maintenanceData.deviceType}`,
        additionalContent: `تم رفض عرض السعر لطلب الصيانة - ${maintenanceData.deviceType} نتمنى أن تراسلنا لمعرفة السبب`,
      },
      {
        to: maintenance.user.email,
        subject: " رفض تكلفة طلب صيانة",
      }
    );

    return NextResponse.json({
      message: "تم رفض عرض السعر ",
      request: maintenanceData,
    });
  } catch (error) {
    console.error("Error accepting cost quote", error);
    return NextResponse.json({ message: " خطأ من الخادم" }, { status: 500 });
  }
}
