// src\app\api\maintenance-requests\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { sendRealMail } from "@/lib/email";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { CreateMaintenance_RequestDto } from "@/utils/dtos";
import { uploadImage } from "@/utils/uploadImage";
import { Role } from "@prisma/client";
import { validateWithAI } from "@/utils/ai-validator";
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

    // In your API route

    try {
      const validation = await validateWithAI({
        deviceImage: formData.get("deviceImage") as File,
        problemDescription: formData.get("problemDescription") as string,
      });

      if (!validation.isValid) {
        return NextResponse.json(
          {
            message: validation.message,
            suggestions: validation.suggestions,
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Validation error:", error);
      return NextResponse.json(
        { message: "حدث خطأ أثناء التحقق من الطلب" },
        { status: 500 }
      );
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

    const technicians = await prisma.user.findMany({
      where: {
        role: Role.TECHNICAL,
        isActive: true,
        technician: { specialization: body.deviceType },
        governorate: body.governorate,
      },
      orderBy: { createdAt: "desc" },
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

    const contentData = `نوع الجهاز: "${data.deviceType}" <br/> موديل الجهاز: "${data.deviceModel}" <br/> العنوان: "${data.address}" <br/> المحافظة: "${data.governorate}" <br/> رقم الجوال: "${data.phoneNo}" <br/> <br/>  <img width="100%" height="20%" src="${newRequest.deviceImage}" alt="requestImage">`;
    const contentDataForNoti = `نوع الجهاز: "${data.deviceType}"  موديل الجهاز: "${data.deviceModel}"  العنوان: "${data.address}"  المحافظة: "${data.governorate}"  رقم الجوال: "${data.phoneNo}"`;
    const userContent = `سيد/ة ${data.userName}  تم إحالة طلبك: "${data.deviceType}"  إلى التقني المختص وسيتم التواصل معك عبر الرقم "${data.phoneNo}" عند استلام الطلب `;
    const seconderyContent = "سارع وقم باستلام الطلب";

    for (const technician of technicians) {
      await createNotification({
        recipientId: technician.id,
        senderId: user.id,
        requestId: newRequest.id,
        title: data.title,
        content: contentDataForNoti,
      });

      await sendRealMail(
        {
          recipientName: technician.fullName,
          mainContent: "يوجد طلب صيانة جديد مناسب لك",
          additionalContent: contentData,
          seconderyContent: seconderyContent,
        },
        {
          to: technician.email,
          subject: data.title,
          requestId: newRequest.id,
        }
      );
    }

    await createNotification({
      recipientId: user.id,
      senderId: user.id,
      requestId: newRequest.id,
      title: data.title,
      content: userContent,
    });

    return NextResponse.json(
      { message: "تم إنشاء طلب الصيانة بنجاح", request: newRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating maintenance request", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
