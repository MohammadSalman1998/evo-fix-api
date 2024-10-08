// src\app\api\maintenance-requests\[id]\complete\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendEmail, sendRealMail } from "@/lib/email";
import { sendSms } from "@/lib/sms";


/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id/complete
 *  @desc   Mark a maintenance request as completed
 *  @access private (technician)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
         status:"IN_PROGRESS",
         technicianId: technician.id
         },
      data: {
        status: RequestStatus.COMPLETED,
      },
      include: { 
        user: {
            select: {
              id: true,
              fullName: true,
              governorate: true,
              email:true,
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
      }

    // Send email to the user
    await sendEmail({
      subject: "تم إكمال طلب الصيانة",
      content: `تم إكمال طلب الصيانة  ${maintenance.deviceType}. يرجى دفع الرسوم ${maintenance.cost} ل.س لاستلام الجهاز.`,
      senderId: technician.id,
      recipientId: maintenance.costumerID
    });

    // Create notification for the user
    await createNotification({
      recipientId: maintenance.costumerID,
      senderId:technician.id,
      title: "إنجاز الطلب",
      content: `تم إكمال طلب الصيانة  ${maintenance.deviceType}. يرجى دفع الرسوم ${maintenance.cost} ل.س لاستلام الجهاز.`,
    });

    await sendSms(`   ترحب بكم EvoFix سيد/ة ${maintenanceRequest.user.fullName}
      إن  طلب الصيانة الخاص بك
      ${maintenance.deviceType}
      تم إنجازه بنجاح يمكنك تسديد كامل الرسوم لاعادة الجهاز 
      ${maintenance.cost} ل.س
      `)


    await sendRealMail({
      to: maintenanceRequest.user.email,
      subject: " إنجاز طلب الصيانة",
      html: ` <div dir="rtl">
  <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
  <h1>سيد/ة ${maintenanceRequest.user.fullName}</h1>
  <h3> لقد تم الانتهاء من طلب الصيانة ${maintenance.deviceType} </h3>
  <h2>سيتم إرسال الفريق التقني الى العنوان بعد أن تستكمل دفع الرسوم </h2>
  <b>${maintenanceRequest.address}</b>
</div>`,
    });

    return NextResponse.json({ message: "تم إكمال طلب الصيانة بنجاح", request: maintenance });
  } catch (error) {
    console.error("Error completing maintenance request", error);
    return NextResponse.json({ message: "خطأ من الخادم أم أن الطلب تم إنجازه من قبل" }, { status: 500 | 401 });
  }
}