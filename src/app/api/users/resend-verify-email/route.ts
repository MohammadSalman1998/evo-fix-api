// src\app\api\users\resend-verify-email\route.ts

// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/utils/db";
// import jwt from "jsonwebtoken";
// import { sendRealMail } from "@/lib/email";

// /**
//  *  @method POST
//  *  @route  ~/api/users/resend-verify-email
//  *  @desc   Resend verification email to user
//  *  @access private (only user himself)
//  */
// export async function POST(request: NextRequest) {
//   try {
//     const { email } = await request.json();

//     // Find the user
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return NextResponse.json(
//         { message: "لم يتم العثور على المستخدم" },
//         { status: 404 }
//       );
//     }

//     if (user.isVerified) {
//       return NextResponse.json(
//         { message: "البريد الإلكتروني مفعل مسبقاً" },
//         { status: 400 }
//       );
//     }

//     // Create verification token
//     const secret = process.env.JWT_SECRET + user.password;
//     const verifyToken = jwt.sign({ id: user.id }, secret, {
//       expiresIn: "15m",
//     });

//     // Create verification URL
//     const verifyUrl = `https://evo-fi.vercel.app/verify-email/${user.id}/${verifyToken}`;

//     // Send verification email
//     try {
//       await sendRealMail(
//         {
//           recipientName: user.fullName,
//           mainContent: "للتحقق من بريدك الإلكتروني، يرجى الضغط على الرابط التالي",
//           additionalContent: verifyUrl,
//         },
//         {
//           to: user.email,
//           subject: "تأكيد البريد الإلكتروني",
//         }
//       );

//       return NextResponse.json(
//         { message: "تم إرسال رابط التحقق مرة أخرى بنجاح" },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error("Error sending verification email:", error);
//       return NextResponse.json(
//         { message: "فشل في إرسال بريد التحقق" },
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     console.error("Error in resend verification:", error);
//     return NextResponse.json(
//       { message: "حدث خطأ أثناء إعادة إرسال التحقق" },
//       { status: 500 }
//     );
//   }
// }


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
 *  @route  ~/api/users/resend-verify-email
 *  @desc   Resend verification email to user
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

        if (user.isVerified) {
      return NextResponse.json(
        { message: "البريد الإلكتروني مفعل مسبقاً" },
        { status: 400 }
      );
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
      //   isActive:
      //   user.role === Role.TECHNICAL ||
      //   user.role === Role.ADMIN ||
      //   user.role === Role.SUBADMIN
      //     ? false
      //     : true,
      },
      // orderBy: { createdAt: "desc" },
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

