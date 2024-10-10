// src\app\api\users\request-reset-password\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import jwt from "jsonwebtoken";
import { sendRealMail } from "@/lib/email";


/**
 *  @method POST
 *  @route  ~/api/users/request-reset-password
 *  @desc   Send password reset email
 *  @access private (only user himself)
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "هذا الحساب غير موجود" }, { status: 404 });
    }

    // Generate a password reset token (JWT)
    const secret = process.env.JWT_SECRET + user.password; // You can include user password to invalidate old tokens if password changes
    const token = jwt.sign({ id: user.id }, secret, { expiresIn: "15m" }); // Valid for 15 minutes

    const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${token}&id=${user.id}`;


    // Email options
    const mailOptions = {
      from: process.env.GOOGLE_EMAIL_APP_EVOFIX,
      to: user.email,
      subject: "طلب إعادة تعيين كلمة المرور",
      html: ` <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h2>انقر <a href="${resetLink}">هنا</a> لإعادة تعيين كلمة المرور، تنتهي صلاحيته بعد 15 دقيقة.</h2>
    </div>`
      
      
      
      
    };

    // Send email
    await sendRealMail(mailOptions);

    return NextResponse.json({ message: "تم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور" }, { status: 200 });

  } catch (error) {
    console.error("Error sending password reset email:", error);
    return NextResponse.json({ message: "خطأ في إرسال البريد الإلكتروني" }, { status: 500 });
  }
}

