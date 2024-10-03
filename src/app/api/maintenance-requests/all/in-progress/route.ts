// src\app\api\maintenance-requests\all\in-progress\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { Requests } from "@/lib/requests";


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/all/in-progress
 *  @desc   Get all in-progress maintenance requests 
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
   const inProgressRequests = await Requests(account.id,"IN_PROGRESS")
   return NextResponse.json(inProgressRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching  maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
