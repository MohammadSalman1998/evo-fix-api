// src\app\api\maintenance-requests\all\technician\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { AllTechTasks } from "@/lib/requests";


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/all/technician
 *  @desc   Get all maintenance requests for all technicians
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
   const TechRequests = await AllTechTasks(account.id)
   return NextResponse.json(TechRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching  maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
