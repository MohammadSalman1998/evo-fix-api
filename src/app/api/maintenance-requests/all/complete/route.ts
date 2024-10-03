// src\app\api\maintenance-requests\all\complete\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { Requests } from "@/lib/requests";


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/all/complete
 *  @desc   Get all complete maintenance requests 
 *  @access private (technician tasks)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account || account.role !== "TECHNICAL") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية " },
        { status: 401 }
      );
    }
   const completeRequests = await Requests(account.id,"COMPLETED")
   return NextResponse.json(completeRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching  maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
