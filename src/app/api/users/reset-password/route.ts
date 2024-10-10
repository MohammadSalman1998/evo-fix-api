// src\app\api\users\reset-password\route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import jwt from "jsonwebtoken";


/**
 *  @method POST
 *  @route  ~/api/users/reset-password
 *  @desc   Reset password
 *  @access private (only user himself)
 */
export async function POST(request: NextRequest) {
  try {
    const { token, id, newPassword } = await request.json();

    // Find user by ID
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!user) {
      return NextResponse.json({ message: "مستخدم غير صالح" }, { status: 400 });
    }

    // Validate the reset token (JWT)
    const secret = process.env.JWT_SECRET + user.password;
    let decoded;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      decoded = jwt.verify(token, secret);
    } catch (error) {
        console.error("Error Token", error);
      return NextResponse.json({ message: "الرمز غير صالح أو منتهي الصلاحية" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" }, { status: 200 });

  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ message: "فشل إعادة تعيين كلمة المرور" }, { status: 500 });
  }
}
