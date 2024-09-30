// src\app\api\users\login\route.ts
import { LoginUserDto } from "@/utils/dtos";
import { LoginUserSchema } from "@/utils/validationSchemas";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import bcrypt from "bcryptjs";
import { setTokenCookie } from "@/utils/generateToken";

/**
 *  @method POST
 *  @route  ~/api/users/login
 *  @desc   login user
 *  @access public
 */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginUserDto;
    const validation = LoginUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return NextResponse.json(
        { message: "الإيميل أو كلمة المرور غير صالحة" },
        { status: 400 }
      );
    }

    const isPasswordMatch = await bcrypt.compare(body.password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: "الإيميل أو كلمة المرور غير صالحة" },
        { status: 400 }
      );
    }

    const cookie = setTokenCookie({
      id: user.id,
      role: user.role,
      fullName: user.fullName,
    });

    return NextResponse.json(
      {
        message: "تمت عملية الدخول بنجاح",
        info: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          governorate: user.governorate,
          address: user.address,
          phoneNO: user.phoneNO,
          role: user.role
        },
        Token: cookie,
      },
      {
        status: 200,
        headers: { "Set-Cookie": cookie },
      }
    );
  } catch (error) {
    console.error("Error fetching Data", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
