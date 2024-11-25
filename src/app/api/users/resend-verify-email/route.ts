// src\app\api\users\resend-verify-email\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import jwt from "jsonwebtoken";
import { sendRealMail } from "@/lib/email";
import { HOME_EVOFIX } from "@/utils/constants";

/**
 *  @method POST
 *  @route  ~/api/users/resend-verify-email
 *  @desc   Resend verification email to user
 *  @access private (only user himself)
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "لم يتم العثور على المستخدم" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "البريد الإلكتروني مفعل مسبقاً" },
        { status: 400 }
      );
    }

    // Create verification token
    const secret = process.env.JWT_SECRET + user.password;
    const verifyToken = jwt.sign({ id: user.id }, secret, {
      expiresIn: "15m",
    });

    // Create verification URL
    const verifyUrl = `${HOME_EVOFIX}/verify-email?token=${verifyToken}&id=${user.id}`;

    // Send verification email
    try {
      await sendRealMail(
        {
          recipientName: user.fullName,
          mainContent: "للتحقق من بريدك الإلكتروني، يرجى الضغط على الرابط التالي",
          additionalContent: verifyUrl,
        },
        {
          to: user.email,
          subject: "تأكيد البريد الإلكتروني",
        }
      );

      return NextResponse.json(
        { message: "تم إرسال رابط التحقق مرة أخرى بنجاح" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error sending verification email:", error);
      return NextResponse.json(
        { message: "فشل في إرسال بريد التحقق" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in resend verification:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إعادة إرسال التحقق" },
      { status: 500 }
    );
  }
}

