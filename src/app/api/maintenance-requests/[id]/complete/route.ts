// src\app\api\maintenance-requests\[id]\complete\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendRealMail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
// import { sendSms } from "@/lib/sms";


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

    if(maintenance.status === "COMPLETED"){
      return NextResponse.json(
        { message: "هذا الطلب تم إنجازه بالفعل" },
        { status: 400 }
      );
    }

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

  
      const maintenanceData = {
          RequestID: maintenanceRequest.id,
          deviceType: maintenanceRequest.deviceType,
          deviceModel: maintenanceRequest.deviceModel,
          problemDescription: maintenanceRequest.problemDescription,
          cost: maintenanceRequest.cost,
          isPaid: maintenanceRequest.isPaid,
          isPaidCheckFee: maintenanceRequest.isPaidCheckFee,
          resultCheck: maintenanceRequest.resultCheck,
          status: maintenanceRequest.status,
          costumerID: maintenanceRequest.user.id,
          costumerName: maintenanceRequest.user.fullName,
          costumerGovernorate: maintenanceRequest.user.governorate,
      }
    // Create notification for the user
    await createNotification({
      recipientId: maintenanceData.costumerID,
      senderId:technician.id,
      title: "إنجاز الطلب",
      content: `تم إنجاز طلب الصيانة  ${maintenanceData.deviceType}. يرجى دفع الرسوم "${maintenanceData.cost}" ل.س لاستلام الجهاز.`,
      requestId: maintenanceRequest.id
    });

    await sendRealMail({
      recipientName: maintenanceRequest.user.fullName,
      mainContent: `لقد تم الانتهاء من طلب الصيانة "${maintenanceData.deviceType}" بنجاح`,
      additionalContent: `لطفا منك، يجب عليك دفع رسوم الصيانة "${maintenanceData.cost}" ل.س لاستلام الجهاز  <br/> وشكرا على ثقتكم بنا <br/> نتمنى أن نكون عند حسن ظنكم `,
    },{
      to: maintenanceRequest.user.email,
      subject: " إنجاز طلب الصيانة",
      requestId: maintenanceRequest.id
    });

   

    try {
      
      await sendSms(`   ترحب بكم EvoFix سيد/ة ${maintenanceRequest.user.fullName}
        إن  طلب الصيانة الخاص بك
        ${maintenanceData.deviceType}
        تم إنجازه بنجاح يمكنك تسديد كامل الرسوم لاعادة الجهاز 
        ${maintenanceData.cost} ل.س
        `)
      } catch (error) {
        console.log(error);
  
        return NextResponse.json(
          {
            message:
              "خطأ بالوصول إلى خادم إرسال الرسائل ولكن تم إنجاز الطلب بنجاح ",
            request: maintenanceData,
          },
          { status: 200 }
        );
      }

    return NextResponse.json({ message: "تم إنجاز طلب الصيانة بنجاح", request: maintenanceData },{status:200});
  } catch (error) {
    console.error("Error completing maintenance request", error);
    return NextResponse.json({ message: "خطأ من الخادم " }, { status: 500 });
  }
}