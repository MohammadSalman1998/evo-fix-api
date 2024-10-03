// src\app\api\maintenance-requests\all\user\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { AllUserRequests } from "@/lib/requests";


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/all/user
 *  @desc   Get all user maintenance requests 
 *  @access private (user his requests)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية " },
        { status: 401 }
      );
    }

   const userRequests = await AllUserRequests(account.id)
   return NextResponse.json(userRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching  maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
