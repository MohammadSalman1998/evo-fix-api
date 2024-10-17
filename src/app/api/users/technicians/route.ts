// src\app\api\users\technicians\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import {
    getAllTechnician,
    getAllTechnicianByGovernorate,
} from "@/lib/accounts";
/**
 *  @method GET
 *  @route  ~/api/users/technicians
 *  @desc   Get all  technicians
 *  @access private ( admin can show all technicians  Or [subAdmin By same governorate])
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

    const subAdmin = await prisma.user.findUnique({
      where: { id: account?.id, role: "SUBADMIN" },
      select: {
        subadmin: {
          select: {
            governorate: true,
          },
        },
      },
    });


    if (admin) {
      const adminTechnicians = await getAllTechnician();
      return NextResponse.json({ adminTechnicians }, { status: 200 });
    }
    if (subAdmin) {
      const subAdminTechnicians = await getAllTechnicianByGovernorate(
        subAdmin.subadmin?.governorate || ""
      );

      return NextResponse.json({ subAdminTechnicians }, { status: 200 });
    }
    return NextResponse.json(
      { messasge: "ليس لديك الصلاحية" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching Technicians", error);
    return NextResponse.json(
      { message: "خطأ في جلب البيانات " },
      { status: 500 }
    );
  }
}
