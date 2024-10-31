// src\app\api\maintenance-requests\count\inProgress\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import {
  countInProgressRequests,
  countInProgressRequestsForSubAdmin,
  countInProgressRequestsForTech,
  countInProgressRequestsForUser,
} from "@/lib/requests";

/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/count/inProgress
 *  @desc   get count of all inProgress requests
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
    // const specialization = infoAccount?.technician?.specialization as string;

    let count;
    if (account.role === "ADMIN") {
      count = await countInProgressRequests();
    }
    if (account.role === "SUBADMIN") {
      count = await countInProgressRequestsForSubAdmin(governorate);
    }
    if (account.role === "TECHNICAL") {
      count = await countInProgressRequestsForTech(account.id);
    }
    if (account.role === "USER") {
      count = await countInProgressRequestsForUser(account.id);
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}