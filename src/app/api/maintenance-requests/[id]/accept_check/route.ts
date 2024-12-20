// src\app\api\maintenance-requests\[id]\accept_check\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus, Role } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendRealMail } from "@/lib/email";
import { CheckFeePaid } from "@/lib/epaid";
import { NewEpaid } from "@/utils/dtos";
import { EpaidSchema } from "@/utils/validationSchemas";

/**
 *  @method POST
 *  @route  ~/api/maintenance-requests/:id/accept_check
 *  @desc   Accept the user to paid of check fee and convert request to  PENDING for all technician
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

    const maintenance = await prisma.maintenanceRequest.findUnique({
      where: {
        id: requestId,
        isPaidCheckFee: false,
        isPaid: false,
        status: "ASSIGNED",
      },
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
        { message: "هذا الطلب غير متاح لدفع أجور الكشف" },
        { status: 404 }
      );
    }

    if (user.id !== maintenance?.customerId || !maintenance.user.isActive) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 403 }
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
      requestId: maintenance.id,
      OperationNumber: body.OperationNumber,
      CheckFee: body.CheckFee,
      textMessage: body.textMessage,
      typePaid: body.typePaid,
    };

    const userSmsPaid = await prisma.sMS.findFirst({
      where: {
        operationNumber: body.OperationNumber,
      },
    });

    if (!userSmsPaid) {
      return NextResponse.json(
        { message: "تأكد من رقم العملية أو  من اتمام عملية الدفع" },
        { status: 400 }
      );
    }

    await CheckFeePaid(CheckFeePaidData);

    // Send notification to  technician
      const technician = await prisma.user.findUnique({
        where: {
          id: maintenance.technicianId || 0,
          role: Role.TECHNICAL,
          isActive: true,
        },
      });

    const maintenanceRequest = await prisma.maintenanceRequest.update({
      where: {
        id: requestId,
        status: "ASSIGNED",
        customerId: user.id,
      },
      data: {
        status: RequestStatus.ASSIGNED,
        isPaidCheckFee: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            governorate: true,
            email: true,
            Epaid: { select: { CheckFee: true } },
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

    const data = {
      title: "طلب صيانة جديد",
      userTitle: "استلام الطلب",
      address: maintenance.address,
      deviceType: maintenance.deviceType,
      deviceModel: maintenance.deviceModel,
      governorate: maintenance.governorate,
      requestId: maintenance.id,
      phoneNo: maintenance.phoneNO,
      userName: user.fullName,
    };
    const contentData = `نوع الجهاز ${data.deviceType} - موديل الجهاز ${data.deviceModel} - العنوان ${data.address} - المحافظة ${data.governorate} - رقم الجوال ${data.phoneNo}`;
    const contentEmailData = `نوع الجهاز: "${data.deviceType}" <br/> موديل الجهاز: "${data.deviceModel}" <br/> العنوان: "${data.address}" <br/> المحافظة: "${data.governorate}" <br/> رقم الجوال: "${data.phoneNo}"`;
    const userContent = `سيد/ة ${data.userName}- شكرا لك - تم إحالة طلبك "${data.deviceType}" - إلى التقني المختص وسيتم التواصل معك عبر الرقم "${data.phoneNo}" `;

    
await Promise.all([
    // Create notification for the technician
     createNotification({
      recipientId: technician?.id || 0,
      senderId: user.id,
      title: data.userTitle,
      content: contentData,
      requestId: data.requestId,
    }),

    // Create notification for the user
     createNotification({
      recipientId: user.id,
      senderId: user.id,
      title: data.userTitle,
      content: userContent,
      requestId: data.requestId,
    }),

    // Send email to the technician
     sendRealMail({
      recipientName: technician?.fullName,
      mainContent: `لقد تم دفع أجور الكشف لطلب الصيانة "${maintenanceData.deviceType}"`,
      additionalContent: `يمكنك الذهاب إلى العنوان المحدد في بيانات الطلب التالية والكشف عليه <br/> ${contentEmailData}`,
    },{
      to: technician?.email || "",
      subject: data.userTitle,
      requestId: data.requestId,
    }),

    // Send email to the user

     sendRealMail({
      recipientName: `${data.userName} شكرا لك`,
      mainContent: `لقد تم دفع أجور الكشف لطلب الصيانة "${maintenanceData.deviceType}" بنجاح`,
      additionalContent: `سيتواصل معك التقني المختص على الرقم "${data.phoneNo}" ويحدد موعد مناسب لك ليتم تشخيص العطل`,
    },{
      to: maintenance.user.email,
      subject: data.userTitle,
      requestId: data.requestId,
    }),
  ])

    return NextResponse.json({
      message: "تم دفع أجور الكشف وإحالة الطلب إلى التقنيين بنجاح",
      request: maintenanceData,
    });
  } catch (error) {
    console.error("Error paid check fee ", error);
    return NextResponse.json({ message: " خطأ من الخادم " }, { status: 500 });
  }
}
