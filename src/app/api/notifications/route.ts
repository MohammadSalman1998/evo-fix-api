// src\app\api\notifications\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { getUserNotifications } from "@/lib/notification";


/**
 *  @method GET
 *  @route  ~/api/notifications
 *  @desc   Get all user notifications
 *  @access private (user or Tech his notifications)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "لايوجد إشعارات لك" },
        { status: 401 }
      );
    }

   const Notifications = await getUserNotifications(account.id)
   return NextResponse.json(Notifications, { status: 200 });
  } catch (error) {
    console.error("Error fetching Notifications", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
