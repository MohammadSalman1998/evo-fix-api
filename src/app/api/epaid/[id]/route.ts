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

      const userSmsPaid = await prisma.sMS.findFirst({
        where: {
          operationNumber: body.OperationNumber,
          amount: {
            gte: maintenanceCompleted.cost || 0
          },
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
  
    const techID = maintenanceCompleted.technicianId;
    const subAdmin = await prisma.user.findFirst({
      where: {
        role: "SUBADMIN",
        governorate: maintenanceCompleted.governorate,
      },
    });

    if(!subAdmin){
      return NextResponse.json(
        {
          message:
            "تأكد SUBADMIN ان كان موجود",
        },
        { status: 400 }
      );
    }

    const technician = await prisma.user.findUnique({
      where: { id: techID || 0 },
    });

    if(!technician){
      return NextResponse.json(
        {
          message:
            "تأكد التقني ان كان موجود",
        },
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

    await CheckFeePaid(CheckFeePaidData);

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
      resultCheck: maintenanceRequest.resultCheck,
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
    const contentEmailData = `نوع الجهاز: "${data.deviceType}" <br/> موديل الجهاز: "${data.deviceModel}" <br/> العنوان: "${data.address}" <br/> المحافظة: "${data.governorate}" <br/> رقم الجوال: "${data.phoneNo}"`;
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
      recipientName: technician?.fullName,
      mainContent: "تم استكمال رسوم الصيانة بنجاح يمكنك استعادة الطلب",
      additionalContent: `للتذكير، بيانات الطلب: <br/> ${contentEmailData}`,
    },{
      to: technician?.email || "",
      subject: data.title,
      requestId: data.requestId,
    });

    // Create email for the subAdmin
    await sendRealMail({
      recipientName: subAdmin?.fullName,
      mainContent: "تم استكمال رسوم الصيانة بنجاح ",
      additionalContent: `للتذكير، بيانات الطلب: <br/> ${contentEmailData}`,
    },{
      to: subAdmin?.email || "",
      subject: data.title,
      requestId: data.requestId,
    });

    // Create email for the user
    await sendRealMail({
      recipientName: technician?.fullName,
      mainContent: "شكرا لك تم استكمال رسوم الصيانة بنجاح ",
      additionalContent: `سيتم التواصل معك على الرقم "${data.phoneNo}" لاستعادة الطلب لديك`,
    },{
      to: maintenanceCompleted.user.email,
      subject: data.userTitle,
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
