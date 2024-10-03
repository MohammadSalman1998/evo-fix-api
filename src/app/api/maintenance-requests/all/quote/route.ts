// src\app\api\maintenance-requests\all\quote\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { Requests } from "@/lib/requests";


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/all/quote
 *  @desc   Get all Quoted maintenance requests 
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
   const QuotedRequests = await Requests(account.id,"QUOTED")
   return NextResponse.json(QuotedRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching  maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
