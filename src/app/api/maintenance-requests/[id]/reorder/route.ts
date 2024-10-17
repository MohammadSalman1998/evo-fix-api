// src\app\api\maintenance-requests\[id]\reorder\route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/utils/db";
import { Role } from '@prisma/client';
import { createNotification } from '@/lib/notification';
import { verifyToken } from "@/utils/verifyToken";
import { sendRealMail } from '@/lib/email';


/**
 *  @method POST
 *  @route  ~/api/maintenance-requests/:id/reorder
 *  @desc   reorder a reject maintenance request + re create notifications for all Technicians
 *  @access public (user)
 */
export async function POST(request: NextRequest,{ params }: { params: { id: string } }) {
  try {

    const requestId = parseInt(params.id);
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 403 },
      );
    }

    const oldRequest = await prisma.maintenanceRequest.findUnique({
        where:{
            id: requestId,
            status: "REJECTED"
        },
        select:{
            customerId:true,
            governorate:true,
            phoneNO:true,
            address:true,
            problemDescription:true,
            deviceType:true,
            deviceModel: true,
            deviceImage: true
        }
    })

    if(!oldRequest){
        return NextResponse.json(
            {message: "هذا الطلب غير متاح لإعادة الطلب"},
            {status: 404}
        )
    }

    if(oldRequest.customerId !== user.id){
        return NextResponse.json(
            {message: "ليس لديك الصلاحية"},
            {status: 403}
        )
    }

    const reSendRequest = await prisma.maintenanceRequest.create({
      data: {
        customerId: user.id,
        governorate: oldRequest.governorate,
        phoneNO: oldRequest.phoneNO,
        address: oldRequest.address,
        deviceType: oldRequest.deviceType,
        deviceModel: oldRequest.deviceModel,
        deviceImage: oldRequest.deviceImage,
        problemDescription: oldRequest.problemDescription,
      },
    });

    // Send notification to all technicians
    const technicians = await prisma.user.findMany({
      where: { role: Role.TECHNICAL, isActive:true },
    });

    const notificationNewOrderData = {
      title: "إعادة طلب صيانة",
      deviceType: `نوع الجهاز: ${reSendRequest.deviceType}`,
      governorate: `المحافظة: ${reSendRequest.governorate}`,
    };


    for (const technician of technicians) {
      await createNotification({
        recipientId: technician.id,
        senderId: user.id,
        title: notificationNewOrderData.title,
        content: `${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}`,
      });

      await sendRealMail({
        to: technician.email,
        subject:notificationNewOrderData.title ,
        html: ` 
        <div dir="rtl">
          <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
          <h1>سيد/ة ${technician.fullName}</h1>
          <h3>هناك طلب صيانة معاد طلبه يمكنك الدخول الى حسابك لمعرفة التفاصيل</h3>
          <h2>${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}</h2>
        </div>
      ` 
      })
    }

    return NextResponse.json({ message: "تم إعادة طلب الصيانة بنجاح", request: reSendRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance request", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
