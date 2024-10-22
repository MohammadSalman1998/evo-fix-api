// src\app\api\termsOfUsePolicy\route.ts

import { createTermsPolicy } from "@/lib/termsOfUsePolicy";
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

