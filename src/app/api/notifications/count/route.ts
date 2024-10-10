// src\app\api\notifications\count\route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import prisma from "@/utils/db";

/**
 *  @method GET
 *  @route  ~/api/notifications/count
 *  @desc   Get count of unread notifications
 *  @access private (every him notifications)
 */

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    const countNotification = await prisma.notification.count({
      where: { recipientId: user?.id, isRead: false },
    });
    if (countNotification > 0) {
      return NextResponse.json({ count: countNotification }, { status: 200 });
    }
    return NextResponse.json({ count: 0 }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Notifications", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
