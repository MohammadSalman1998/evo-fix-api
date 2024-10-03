// src\app\api\maintenance-requests\all\sub-admin\route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/verifyToken";
import {AllRequestsByGovernorate } from "@/lib/requests";
import prisma from "@/utils/db";


/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/all/subadmin
 *  @desc   Get all maintenance requests for all SubAdmin
 *  @access private (SubAdmin by his governorate)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account || account.role !== "SUBADMIN") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية " },
        { status: 401 }
      );
    }
    const subAdminUser = await prisma.user.findUnique({
      where:{
        id: account?.id
      },
      select:{
        subadmin:{
          select:{
            governorate: true
          }
        }
      }
    })

   const governorate = subAdminUser?.subadmin?.governorate as string
   const subAdminRequests = await AllRequestsByGovernorate(governorate)
   return NextResponse.json(subAdminRequests, { status: 200 });
  } catch (error) {
    console.error("Error fetching  maintenance requests by governorate", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
