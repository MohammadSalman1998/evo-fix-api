// src\app\api\maintenance-requests\[id]\quote\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { sendRealMail } from "@/lib/email";
import { verifyToken } from "@/utils/verifyToken";
import { sendSms } from "@/lib/sms";
import { CostSchema } from "@/utils/validationSchemas";

/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id/quote
 *  @desc   Provide a cost quote for a maintenance request
 *  @access private (technician)
 */

interface costDto {
  cost: number;
  resultCheck: string;
}
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

    const body = (await request.json()) as costDto;
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

    if (maintenance.status === "QUOTED") {
      return NextResponse.json(
        { message: "هذا الطلب معلق بالفعل" },
        { status: 400 }
      );
    }

    const validate = CostSchema.safeParse(body);
    if (!validate.success) {
      return NextResponse.json(
        { message: validate.error.errors[0].message },
        { status: 400 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
        id: requestId,
        status: "ASSIGNED",
        isPaidCheckFee:true
      },
      data: {
        cost: body.cost,
        status: RequestStatus.QUOTED,
        resultCheck: body.resultCheck,
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
    };

    // Create notification for the user
    await createNotification({
      recipientId: maintenanceRequest.customerId,
      senderId: technician.id,
      title: "تكلفة الطلب",
      content: `إن التكلفة المقدرة لطلب الصيانة "${maintenanceData.deviceType}" هي "${maintenanceData.cost}" ل.س, إن العطل الذي سيتم صيانته هو "${maintenanceData.resultCheck}" هل توافق لنبدأ بالصيانة  ؟`,
      requestId: maintenanceRequest.id,
    });

    await sendRealMail(
      {
        recipientName: technician?.fullName,
        mainContent: `إن التكلفة المقدرة لطلب الصيانة "${maintenanceData.deviceType}" هي "${maintenanceData.cost}" ل.س <br/> إن العطل الذي سيتم صيانته هو "${maintenanceData.resultCheck}"`,
        additionalContent: `يمكنك العودة الى المنصة وارسال موافقتك على التكلفة ليتم البدء بالصيانة أو الرفض حتى يتم استرجاع القطعة`,
      },
      {
        to: maintenanceRequest.user.email,
        subject: " تكلفة طلب صيانة",
        requestId: maintenanceRequest.id,
      }
    );

    try {
      await sendSms(`   ترحب بكم EvoFix سيد/ة ${maintenanceRequest.user.fullName}
          إن تكلفة طلب الصيانة الخاص بك
          ${maintenanceData.deviceType} 
          هي ${maintenanceData.cost} ل.س
          إن كنت موافق قم بالعودة إلى المنصة وتحديث الطلب للموافقة على التكلفة `);
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        {
          message:
            "خطأ بالوصول إلى خادم إرسال الرسائل ولكن تم تقديم عرض التكلفة بنجاح ",
          request: maintenanceData,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "تم تقديم عرض السعر بنجاح",
        request: maintenanceData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error providing cost quote", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
