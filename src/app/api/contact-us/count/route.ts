// src\app\api\contact-us\count\route.ts
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";


  /**
 *  @method GET
 *  @route  ~/api/contact-us
 *  @desc   get count of un read contact-us
 *  @access private (only admin)
 */

  export async function GET(request: NextRequest) {
    try {
      const account = verifyToken(request);
      if (!account) {
        return NextResponse.json(
          { message: "قم بتسجيل الدخول أولاً" },
          { status: 403 }
        );
      }
  
  
      if (account.role === "ADMIN") {
        const countContactUs = await prisma.email.count({
            where:{isRead:false}
        });
        if(countContactUs){

            return NextResponse.json({ countContactUs }, { status: 200 });
        }else{
            return NextResponse.json({message: "لا توجد مراسلات جديدة" }, { status: 200 });

        }
      }
  

      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    } catch (error) {
      console.error("Error fetching count of contact us", error);
      return NextResponse.json(
        { message: "خطأ في جلب البيانات " },
        { status: 500 }
      );
    }
  }