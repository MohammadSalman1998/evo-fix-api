// src\app\api\emails\sent\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { getSentEmails } from "@/lib/email";


/**
 *  @method GET
 *  @route  ~/api/emails/sent
 *  @desc   Get all emails sent 
 *  @access private (user or Tech his emails)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "لايوجد إيميلات لك" },
        { status: 401 }
      );
    }

   const emailsSent = await getSentEmails(account.id)
   return NextResponse.json(emailsSent, { status: 200 });
  } catch (error) {
    console.error("Error fetching Emails", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
