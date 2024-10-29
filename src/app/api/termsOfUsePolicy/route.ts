// src\app\api\termsOfUsePolicy\route.ts

import { createTermsPolicy } from "@/lib/termsOfUsePolicy";
import prisma from "@/utils/db";
import { createTermsOfUsePolicyDto } from "@/utils/dtos";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

/**
 *  @method POST
 *  @route  ~/api/termsOfUsePolicy
 *  @desc   create new termsOfUsePolicy
 *  @access private (only  Admin)
 */

export async function POST(request: NextRequest) {
  try {
    const admin = verifyToken(request);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }
    const body = (await request.json()) as createTermsOfUsePolicyDto;
    const data: createTermsOfUsePolicyDto = {
      version: body.version,
      title: body.title,
      content: body.content,
    };

    const TermsPolicy = await createTermsPolicy(data);
    return NextResponse.json(
      { message: "تم إضافة شروط سياسة الاستخدام بنجاح", TermsPolicy },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error create termsPolicy", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}


/**
 *  @method GET
 *  @route  ~/api/termsOfUsePolicy
 *  @desc   get all termsOfUsePolicy
 *  @access public
 */

export async function GET() {
  try {
    
    const TermsPolicy = await prisma.termsOfUsePolicy.findMany()
    if(TermsPolicy.length < 1){
      return NextResponse.json(
        {message: "لاتوجد سياسة استخدام للمنصة بعد" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {TermsPolicy },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error get all termsPolicy", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

