// src\app\api\maintenance-requests\all\Pending\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import { PendingRequests } from "@/lib/requests";
import prisma from "@/utils/db";


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/all/Pending
 *  @desc   Get all Pending maintenance requests for all technicians
 *  @access private (technician)
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
    const tech = await prisma.user.findUnique({
      where:{id: account.id},
      include:{technician:true}
    })
    const specialization = tech?.technician?.specialization as string
   const PendingRequest = await PendingRequests(specialization)
   return NextResponse.json(PendingRequest, { status: 200 });
  } catch (error) {
    console.error("Error fetching  maintenance requests", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
