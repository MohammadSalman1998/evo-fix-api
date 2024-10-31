// src\app\api\users\invoices\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import {
  getAllInvoices,
  getByGovernorateInvoices,
  getMyInvoices,
  getTechInvoices,
} from "@/lib/invoice";
/**
 *  @method GET
 *  @route  ~/api/users/invoices
 *  @desc   Get all users invoices
 *  @access private (only user himself or admin can show all users invoices  Or [subAdmin By same governorate])
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

    const user = await prisma.user.findUnique({
      where: { id: account?.id, role: "USER" },
    });

    const tech = await prisma.user.findUnique({
      where:{id: account.id, role: "TECHNICAL"}
    })

    if (user) {
      const userInvoice = await getMyInvoices(user.id);
      return NextResponse.json({ userInvoice }, { status: 200 });
    }
    if (tech) {
      const userInvoice = await getTechInvoices(tech.id);
      return NextResponse.json({ userInvoice }, { status: 200 });
    }
    if (admin) {
      const adminInvoice = await getAllInvoices();
      return NextResponse.json({ adminInvoice }, { status: 200 });
    }
    if (subAdmin) {
      const subAdminInvoice = await getByGovernorateInvoices(
        subAdmin.subadmin?.governorate || ""
      );

      return NextResponse.json({ subAdminInvoice }, { status: 200 });
    }
    return NextResponse.json(
      { messasge: "ليس لديك الصلاحية" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching Invoices", error);
    return NextResponse.json(
      { message: "خطأ في جلب البيانات " },
      { status: 500 }
    );
  }
}
