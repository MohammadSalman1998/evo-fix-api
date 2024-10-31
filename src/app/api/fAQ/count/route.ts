// src\app\api\fAQ\count\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { countNotPublishedFAQ } from "@/lib/faq";

/**
 *  @method GET
 *  @route  ~/api/fAQ/count
 *  @desc   get count of all fAQ not published
 *  @access private (only  subAdmin  or admin)
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

    let count;
    if (account.role === "ADMIN" || account.role === "SUBADMIN") {
      count = await countNotPublishedFAQ();
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
