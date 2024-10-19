// src\app\api\maintenance-requests\[id]\accept\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendRealMail } from "@/lib/email";
import { createInvoice } from "@/lib/invoice";
import { newInvoice } from "@/utils/dtos";

/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id/accept
 *  @desc   Accept the cost quote for a maintenance request
 *  @access private (user)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      user.id !== maintenance?.customerId ||
      !maintenance.user.isActive
    ) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 403 }
      );
    }

    if (maintenance.status === "IN_PROGRESS") {
      return NextResponse.json(
        { message: "هذا الطلب تم قبوله بالفعل" },
        { status: 400 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
        id: requestId,
        status: "QUOTED",
        customerId: user.id,
      },
      data: {
        status: RequestStatus.IN_PROGRESS,
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
      resultCheck: maintenanceRequest.resultCheck,
      status: maintenanceRequest.status,
      costumerID: maintenanceRequest.user.id,
      costumerName: maintenanceRequest.user.fullName,
      costumerGovernorate: maintenanceRequest.user.governorate,
    };

    const date_time = new Date();

    const invoiceData: newInvoice ={
      userId: user.id,
      requestId: requestId,
      amount: maintenance.cost || 0 ,
      issueDate:  date_time,
      dueDate: date_time,
      isPaid: false,
    } 

   const invoice = await createInvoice(invoiceData)

    // Send email to the technician
    if (maintenanceRequest.technician && maintenanceRequest.technician.user) {
      

      // Create notification for the technician
      await createNotification({
        recipientId: maintenanceRequest.technician?.user.id,
        senderId: user.id,
        title: "قبول تكلفة الطلب",
        content: `تم قبول عرض السعر لطلب الصيانة - ${maintenanceData.deviceType} - يمكنك البدء بالصيانة`,
        requestId: maintenanceRequest.id
      });



      await sendRealMail({
        recipientName: maintenanceRequest.technician.user.fullName,
        mainContent: `لقد تمت الموافقة على تكلفة طلب الصيانة ${maintenanceData.deviceType}`,
        additionalContent: `يمكنك البدء بالصيانة`,
      },{
        to: maintenanceRequest.technician.user.email,
        subject: "قبول تكلفة الطلب",
        requestId: maintenanceRequest.id
      });

    }

    await createNotification({
      recipientId: maintenanceRequest.user.id,
      senderId: user.id,
      title: "قبول تكلفة الطلب",
      content: `شكرا لك سيد/ة $${maintenanceRequest.user.fullName} سيتم البدء بالصيانة وإخبارك عند الإنجاز`,
      requestId: maintenanceRequest.id
    });

    await sendRealMail({
      recipientName: maintenanceRequest.user.fullName,
      mainContent: `شكرا لك`,
      additionalContent: `سيتم البدء بالصيانة وإخبارك عند الإنجاز`,
    },{
      to: maintenanceRequest.user.email,
      subject: "قبول تكلفة الطلب",
      requestId: maintenanceRequest.id
    });

    return NextResponse.json({
      message: "تم قبول عرض السعر بنجاح",
      request: maintenanceData,
      invoice
    });
  } catch (error) {
    console.error("Error accepting cost quote", error);
    return NextResponse.json(
      { message: " خطأ من الخادم " },
      { status: 500  }
    );
  }
}
