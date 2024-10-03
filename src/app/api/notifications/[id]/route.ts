// src\app\api\notifications\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { markNotificationAsRead } from "@/lib/notification";


/**
 *  @method PUT
 *  @route  ~/api/notifications/:id
 *  @desc   edit  user notification to make it read is true
 *  @access private (user or Tech his notifications)
 */

interface Props {
    params: { id: string };
  }

  export async function PUT(request: NextRequest, { params }: Props) {
try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "لايوجد إشعارات لك" },
        { status: 401 }
      );
    }

    const notificationID = parseInt(params.id)
   const readNotifications = await markNotificationAsRead(notificationID,account.id)
   return NextResponse.json(readNotifications, { status: 200 });
} catch (error) {
    console.error("Error fetching Notifications", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
}

  }