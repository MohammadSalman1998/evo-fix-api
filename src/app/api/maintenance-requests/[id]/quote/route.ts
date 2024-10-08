// src\app\api\maintenance-requests\[id]\quote\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { sendEmail, sendRealMail } from "@/lib/email";
import { verifyToken } from "@/utils/verifyToken";
import { sendSms } from "@/lib/sms";

/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id/quote
 *  @desc   Provide a cost quote for a maintenance request
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

    const { cost } = await request.json();
    const requestId = parseInt(params.id);

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
         id: requestId ,
         status: "ASSIGNED",
        },
      data: {
        cost: cost,
        status: RequestStatus.QUOTED,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            governorate: true,
            email:true
          },
        },
      },
    });

    if (technician.id !== maintenanceRequest.technicianId) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 401 }
      );
    }

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
    }

    // Send email to the user
      await sendEmail({
        subject: "تم تقديم عرض سعر لطلب الصيانة",
        content: `تم تقديم عرض سعر لطلب الصيانة  ${maintenance.deviceType}. التكلفة المقدرة: ${cost}`,
        senderId: technician.id,
        recipientId: maintenance.costumerID,
      });

    // Create notification for the user
    await createNotification({
      recipientId: maintenanceRequest.customerId,
      senderId:technician.id ,
      title:"تكلفة الطلب",
      content: `إن تكلفة الصيانة لطلب الصيانة  - ${maintenance.deviceType} هي ${maintenance.cost} ل.س هل توافق لنبدأ بالصيانة أم لا ؟`,
    });

    await sendSms(`   ترحب بكم EvoFix سيد/ة ${maintenanceRequest.user.fullName}
      إن تكلفة طلب الصيانة الخاص بك
      ${maintenance.deviceType} 
      هي ${maintenance.cost} ل.س
      إن كنت موافق قم بالعودة إلى المنصة وتحديث الطلب للموافقة على التكلفة `)

    await sendRealMail({
      to: maintenanceRequest.user.email,
      subject: " تكلفة طلب صيانة",
      html: ` <div dir="rtl">
  <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
  <h1>سيد/ة ${maintenanceRequest.user.fullName}</h1>
  <h2> إن تكلفة الصيانة لطلب الصيانة  - ${maintenance.deviceType} هي ${maintenance.cost} ل.س هل توافق لنبدأ بالصيانة أم لا ؟  </h2>
  <b>يمكنك العودة الى المنصة وارسال موافقتك على التكلفة ليتم البدء بالصيانة أو الرفض حتى يتم استرجاع القطعة</b>
</div>`,
    });

    return NextResponse.json({
      message: "تم تقديم عرض السعر بنجاح",
      request: maintenance,
    });
  } catch (error) {
    console.error("Error providing cost quote", error);
    return NextResponse.json({ message: "خطأ من الخادم أم أن الطلب معلق بالفعل" }, { status: 500 | 401 });
  }
}
