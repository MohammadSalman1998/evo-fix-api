// src\app\api\maintenance-requests\count\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import {
  countAllRequests,
  countAllRequestsForSubAdmin,
  countAllRequestsForTech,
  countAllRequestsForUser,
} from "@/lib/requests";

/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/count
 *  @desc   get count of all requests
 *  @access private (only user him request or subAdmin by governorate or tech by him tasks or admin)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول" },
        { status: 403 }
      );
    }

    const infoAccount = await prisma.user.findUnique({
      where: { id: account?.id },
      include: {
        customer: true,
        technician: true,
        subadmin: true,
      },
    });
    const governorate = infoAccount?.subadmin?.governorate as string;
    let count;
    if (account.role === "ADMIN") {
      count = await countAllRequests();
    }
    if (account.role === "SUBADMIN") {
      count = await countAllRequestsForSubAdmin(governorate);
    }
    if (account.role === "TECHNICAL") {
      count = await countAllRequestsForTech(account.id);
    }
    if (account.role === "USER") {
      count = await countAllRequestsForUser(account.id);
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
