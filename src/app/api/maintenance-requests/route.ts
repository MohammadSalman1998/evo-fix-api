// src\app\api\maintenance-requests\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
// import { Role, RequestStatus } from '@prisma/client';
import { sendRealMail } from "@/lib/email";
import { createNotification } from "@/lib/notification";
// import { MaintenanceRequestSchema } from "@/utils/validationSchemas";
import { verifyToken } from "@/utils/verifyToken";
import { CreateMaintenance_RequestDto } from "@/utils/dtos";
import { uploadImage } from "@/utils/uploadImage";
import { Role } from "@prisma/client";

/**
 *  @method POST
 *  @route  ~/api/maintenance-requests
 *  @desc   Create a new maintenance request + create notifications for all Technicians
 *  @access public (user)
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const body: Partial<CreateMaintenance_RequestDto> = {
      governorate: formData.get("governorate") as string,
      phoneNO: formData.get("phoneNO") as string,
      address: formData.get("address") as string,
      deviceType: formData.get("deviceType") as string,
      deviceModel: formData.get("deviceModel") as string,
      problemDescription: formData.get("problemDescription") as string,
    };

    const image = formData.get("deviceImage") as File | null;

    // const validation = MaintenanceRequestSchema.safeParse(body);
    // if (!validation.success) {
    //   return NextResponse.json(
    //     { message: validation.error.errors[0].message },
    //     { status: 400 }
    //   );
    // }

    if (
      body.governorate === null ||
      body.phoneNO === null ||
      body.address === null ||
      body.deviceType === null ||
      body.deviceModel === null ||
      body.problemDescription === null
    ) {
      return NextResponse.json({ message: "هناك حقل فارغ" }, { status: 400 });
    }

    // Handle image upload
    let deviceImageUrl =
      "https://res.cloudinary.com/dnzzud7om/image/upload/v1728983834/EvoFix-Requests-Images/thgficihutgngdchsdkt.jpg";
    if (image && image instanceof File) {
      const imageBuffer = await image.arrayBuffer();
      deviceImageUrl = await uploadImage(Buffer.from(imageBuffer));
    }

    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        customerId: user.id,
        governorate: body.governorate!,
        phoneNO: body.phoneNO!,
        address: body.address!,
        deviceType: body.deviceType!,
        deviceModel: body.deviceModel!,
        deviceImage: deviceImageUrl,
        problemDescription: body.problemDescription!,
        status: "PENDING"!,
      },
    });

    const userData = await prisma.user.findUnique({
      where: { id: user.id, isActive: true },
    });

    const technicians = await prisma.user.findMany({
      where: {
        role: Role.TECHNICAL,
        isActive: true,
        technician: { specialization: body.deviceType },
        governorate: body.governorate,
      },
    });

    const data = {
      title: "طلب صيانة جديد",
      userTitle: "دفع أجور الكشف",
      address: newRequest.address,
      deviceType: newRequest.deviceType,
      deviceModel: newRequest.deviceModel,
      governorate: newRequest.governorate,
      requestId: newRequest.id,
      phoneNo: newRequest.phoneNO,
      userName: user.fullName,
    };

    const contentData = `نوع الجهاز ${data.deviceType} - موديل الجهاز ${data.deviceModel} - العنوان ${data.address} - المحافظة ${data.governorate} - رقم الجوال ${data.phoneNo}`;
    const userContent = `سيد/ة ${data.userName} - تم إحالة طلبك "${data.deviceType}" - إلى التقني المختص وسيتم التواصل معك عبر الرقم "${data.phoneNo}" `;

    for (const technician of technicians) {
      await createNotification({
        recipientId: technician.id,
        senderId: user.id,
        requestId: newRequest.id,
        title: data.title,
        content: contentData,
      });

      await sendRealMail({
        to: technician.email,
        subject: data.title,
        requestId: newRequest.id,
        html: `
    <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h1>سيد/ة ${technician.fullName}</h1>
      <h3>${contentData}</h3>
    </div>
  `,
      });
    }

    await createNotification({
      recipientId: user.id,
      senderId: user.id,
      requestId: newRequest.id,
      title: data.title,
      content: userContent,
    });

    if (userData) {
      await sendRealMail({
        to: userData.email,
        subject: data.title,
        requestId: newRequest.id,
        html: `
    <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h1>سيد/ة ${user.fullName}</h1>
      <h3>${userContent}</h3>
    </div>
  `,
      });
    }

    return NextResponse.json(
      { message: "تم إنشاء طلب الصيانة بنجاح", request: newRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating maintenance request", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
