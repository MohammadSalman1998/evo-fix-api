// src\app\api\users\verify-email\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { generateJWT } from "@/utils/generateToken";
import { createNotification } from "@/lib/notification";
import { sendRealMail } from "@/lib/email";
import { sendSms } from "@/lib/sms";


/**
 *  @method POST
 *  @route  ~/api/users/verify-email
 *  @desc   verify-email of new user
 *  @access private (only user himself)
 */
export async function POST(request: NextRequest) {
  try {
    const { verifyToken, id } = await request.json();

    // العثور على المستخدم
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { technician: true, subadmin: true, customer: true },
    });
    if (!user) {
      return NextResponse.json({ message: "مستخدم غير صالح" }, { status: 400 });
    }

    // التحقق من الرمز
    const secret = process.env.JWT_SECRET + user.password;
    let decoded;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      decoded = jwt.verify(verifyToken, secret);
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "الرمز غير صالح أو منتهي الصلاحية" },
        { status: 400 }
      );
    }

    // تفعيل الحساب
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        isActive: user.role === "USER" ? true : false,
      },
    });

    const userResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNO: user.phoneNO,
      governorate: user.governorate,
      role: user.role,
      // customerId: user.customer?.id,
      technician_specialization: user.technician?.specialization,
      technician_services: user.technician?.services,
      admin_department: user.subadmin?.department,
      admin_governorate: user.subadmin?.governorate,
    };

    // return NextResponse.json({ message: "تم التحقق من البريد الإلكتروني بنجاح" }, { status: 200 });

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: [Role.ADMIN, Role.SUBADMIN],
        },
        isActive:
        user.role === Role.TECHNICAL ||
        user.role === Role.ADMIN ||
        user.role === Role.SUBADMIN
          ? false
          : true,
      },
      orderBy: { createdAt: "desc" },
    });
    const tokenPayload = {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
    };

    const token = generateJWT(tokenPayload);

    const notificationNewTechAccountData = {
      title: "طلب تفعيل حساب تقني",
      name: `الاسم: ${user.fullName}`,
      specialization: `الاختصاص: ${user.technician?.specialization}`,
    };

    for (const admin of admins) {
      if (user.role === Role.TECHNICAL) {
        if (
          admin.role === "ADMIN" ||
          (admin.governorate === user.governorate && admin.role === "SUBADMIN")
        ) {
          await createNotification({
            senderId: user.id,
            recipientId: admin.id,
            title: notificationNewTechAccountData.title,
            content: `${notificationNewTechAccountData.name} - ${notificationNewTechAccountData.specialization}`,
          });

          await sendRealMail(
            {
              recipientName: admin.fullName,
              mainContent: `هناك طلب حساب تقني جديد باسم "${user.fullName}"`,
              additionalContent: `${notificationNewTechAccountData.specialization}`,
            },
            {
              to: admin.email,
              subject: notificationNewTechAccountData.title,
            }
          );

          try {
            await sendSms(`   ترحب بكم EvoFix سيد/ة ${admin.fullName}
                يوجد طلب حساب تقني جديد  ${notificationNewTechAccountData.name} - ${notificationNewTechAccountData.specialization} `);
          } catch (error) {
            console.log(error);

            return NextResponse.json(
              {
                message:
                  "خطأ بالوصول إلى خادم إرسال الرسائل ولكن تم التحقق من البريد الإلكتروني وتسجيل الحساب بنجاح ",
                ...userResponse,
                token,
              },
              { status: 201 }
            );
          }
        }
      }
    }

    return NextResponse.json(
      { message: "تم التحقق من البريد الإلكتروني وتسجيل الحساب بنجاح", ...userResponse, token },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { message: "فشل التحقق من البريد الإلكتروني" },
      { status: 500 }
    );
  }
}
