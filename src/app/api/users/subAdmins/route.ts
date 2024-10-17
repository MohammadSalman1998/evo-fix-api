// src\app\api\users\subAdmins\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import {
    getAllSubAdmin,
} from "@/lib/accounts";
/**
 *  @method GET
 *  @route  ~/api/users/subAdmins
 *  @desc   Get all  subAdmins
 *  @access private ( admin can show all subAdmins)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 403 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: account?.id, role: "ADMIN" },
    });



    if (admin) {
      const adminSubAdmins = await getAllSubAdmin();
      return NextResponse.json({ adminSubAdmins }, { status: 200 });
    }

    return NextResponse.json(
      { messasge: "ليس لديك الصلاحية" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching SUBADMIN", error);
    return NextResponse.json(
      { message: "خطأ في جلب البيانات " },
      { status: 500 }
    );
  }
}
