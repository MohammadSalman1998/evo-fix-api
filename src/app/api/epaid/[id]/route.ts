// src\app\api\epaid\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendRealMail } from "@/lib/email";
import { CheckFeePaid } from "@/lib/epaid";
import { NewEpaid, updateinvoice } from "@/utils/dtos";
import { EpaidSchema } from "@/utils/validationSchemas";
import { updateInvoice } from "@/lib/invoice";

/**
 *  @method POST
 *  @route  ~/api/epaid/:id
 *  @desc   epaid for order has been completed
 *  @access private (only user of him request)
 */

export async function POST(
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
    const body = (await request.json()) as NewEpaid;
    const requestId = parseInt(params.id);

    const maintenanceCompleted = await prisma.maintenanceRequest.findUnique({
      where: {
        id: requestId,
        status: "COMPLETED",
        customerId: user.id,
        isPaidCheckFee: true,
        isPaid: false,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!maintenanceCompleted) {
      return NextResponse.json(
        {
          message:
            "هذا الطلب غير متاح لدفع رسومه، الرجاء التأكد من اتمام جميع إجراءات الطلب",
        },
        { status: 400 }
      );
    }

    const epaidValidate = EpaidSchema.safeParse(body);
    if (!epaidValidate.success) {
      return NextResponse.json(
        { message: epaidValidate.error.errors[0].message },
        { status: 400 }
      );
    }


      const CheckFeePaidData: NewEpaid = {
        senderId: user.id,
        requestId:requestId || maintenanceCompleted.id,
        OperationNumber: body.OperationNumber,
        amount: body.amount,
        textMessage: body.textMessage,
        typePaid: body.typePaid,
      };
  
      const userSmsPaid = await prisma.sMS.findFirst({
        where: {
          operationNumber: body.OperationNumber,
          amount: maintenanceCompleted.cost,
        },
      });
  
      if (!userSmsPaid) {
        return NextResponse.json(
          {
            message:
              "تأكد من رقم العملية أو  من اتمام عملية الدفع أو من دفع الرسوم كاملة",
          },
          { status: 400 }
        );
      }
  
      await CheckFeePaid(CheckFeePaidData);


   

    const techID = maintenanceCompleted.technicianId;
    const subAdmin = await prisma.user.findFirst({
      where: {
        role: "SUBADMIN",
        governorate: maintenanceCompleted.governorate,
      },
    });

    const technician = await prisma.user.findUnique({
      where: { id: techID || 0 },
    });

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
        id: requestId,
        status: "COMPLETED",
        customerId: user.id,
        isPaidCheckFee: true,
      },
      data: {
        isPaid: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            governorate: true,
            email: true,
            Epaid: { select: { amount: true } },
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

    const date_time = new Date();

    const invoiceData: updateinvoice ={
      requestId: requestId,
      dueDate: date_time,
      isPaid: true,
      paidAt: date_time
    } 

    const invoice = await updateInvoice(invoiceData)

    const data = {
      title: "استكمال رسوم الصيانة",
      userTitle: "دفع رسوم الصيانة",
      address: maintenanceCompleted.address,
      deviceType: maintenanceCompleted.deviceType,
      deviceModel: maintenanceCompleted.deviceModel,
      governorate: maintenanceCompleted.governorate,
      requestId: maintenanceCompleted.id,
      phoneNo: maintenanceCompleted.phoneNO,
      userName: user.fullName,
    };
    const contentData = `نوع الجهاز ${data.deviceType} - موديل الجهاز ${data.deviceModel} - العنوان ${data.address} - المحافظة ${data.governorate} - رقم الجوال ${data.phoneNo}`;
    const userContent = `سيد/ة ${data.userName} - تم استكمال رسوم الصيانة بنجاح للطلب "${data.deviceType}" - سيتم الاتصال بك على الرقم: "${data.phoneNo}" وإعادة الجهاز إليك `;

    // Create notification for the technician
    await createNotification({
      recipientId: technician?.id || 0,
      senderId: user.id,
      title: data.title,
      content: contentData,
      requestId: data.requestId,
    });

    // Create notification for the subAdmin
    await createNotification({
      recipientId: subAdmin?.id || 0,
      senderId: user.id,
      title: data.title,
      content: contentData,
      requestId: data.requestId,
    });

    // Create notification for the user
    await createNotification({
      recipientId: user.id,
      senderId: user.id,
      title: data.userTitle,
      content: userContent,
      requestId: data.requestId,
    });

    // Create email for the technician
    await sendRealMail({
      to: technician?.email || "",
      subject: data.title,
      html: ` <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h1>سيد/ة ${technician?.fullName}</h1>
      <h3> تم استكمال رسوم الصيانة بنجاح يمكنك استعادة الطلب</h3>
      <h2>${contentData}</h2>
    </div>`,
      requestId: data.requestId,
    });

    // Create email for the subAdmin
    await sendRealMail({
      to: subAdmin?.email || "",
      subject: data.title,
      html: ` <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h1>سيد/ة ${subAdmin?.fullName}</h1>
      <h3> تم استكمال رسوم الصيانة بنجاح للطلب</h3>
      <h2>${contentData}</h2>
    </div>`,
      requestId: data.requestId,
    });

    // Create email for the user
    await sendRealMail({
      to: maintenanceCompleted.user.email,
      subject: data.userTitle,
      html: ` <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h1>سيد/ة ${data.userName}</h1>
      <h3> ${userContent} </h3>
    </div>`,
      requestId: data.requestId,
    });

    return NextResponse.json({
      message: "تم دفع رسوم الصيانة بنجاح سيتم الاتصال بك وإعادة الجهاز مباشرة",
      request: maintenanceData,
      invoice
    });
  } catch (error) {
    console.error("Error paid fee ", error);
    return NextResponse.json({ message: " خطأ من الخادم ", error: error }, { status: 500 });
  }
}
