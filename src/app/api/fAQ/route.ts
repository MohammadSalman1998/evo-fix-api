// src\app\api\fAQ\route.ts

import { createFAQ, getAllFAQ } from "@/lib/faq";
import prisma from "@/utils/db";
import { createFAQDto } from "@/utils/dtos";
// import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

/**
 *  @method POST
 *  @route  ~/api/fAQ
 *  @desc   create new fAQ
 *  @access public
 */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as createFAQDto;
    const data: createFAQDto = {
      question: body.question,
      category: body.category,
    };
    const faq = await createFAQ(data);
    return NextResponse.json(
      { message: "تم إرسال السؤال بنجاح", faq },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error create fAQ", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method GET
 *  @route  ~/api/fAQ
 *  @desc   get all fAQs
 *  @access public
 */

export async function GET() {
  try {
    const countFAQ = await prisma.fAQ.count({ where: { isPublished: true } });

    if (countFAQ < 1) {
      return NextResponse.json(
        { message: "ليس هناك أسئلة متاحة" },
        { status: 200 }
      );
    }
    const faqs = await getAllFAQ();
    return NextResponse.json({ faqs }, { status: 200 });
  } catch (error) {
    console.error("Error get all fAQ", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
