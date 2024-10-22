// src\app\api\fAQ\[id]\route.ts
import { getFAQ, updateFAQ,deleteFAQ } from "@/lib/faq";
import prisma from "@/utils/db";
import { UpdateFAQDto } from "@/utils/dtos";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: {
    id: string;
  };
}

/**
 *  @method GET
 *  @route  ~/api/fAQ/:id
 *  @desc   get a fAQ
 *  @access public
 */

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const faqID = parseInt(params.id);
    const findFAQ = await getFAQ(faqID);
    if (!findFAQ) {
      return NextResponse.json(
        { message: "هذا السؤال غير متاح" },
        { status: 404 }
      );
    }
    return NextResponse.json({ findFAQ }, { status: 200 });
  } catch (error) {
    console.error("Error get a fAQ", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method PUT
 *  @route  ~/api/fAQ/:id
 *  @desc   update a fAQ
 *  @access private (only admin)
 */

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const admin = verifyToken(request);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }

    const faqID = parseInt(params.id);
    const body = (await request.json()) as UpdateFAQDto;
    const findFAQ = await prisma.fAQ.findUnique({ where: { id: faqID } });

    if (!findFAQ) {
      return NextResponse.json(
        { message: "هذا السؤال غير متاح" },
        { status: 404 }
      );
    }
    const data: UpdateFAQDto = {
      question: body.question,
      answer: body.answer,
      category: body.category,
      isPublished: body.isPublished,
    };
    const FAQ = await updateFAQ(faqID, data);
    return NextResponse.json(
      { message: "تم التعديل بنجاح", FAQ },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error update a fAQ", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}


/**
 *  @method DELETE
 *  @route  ~/api/fAQ/:id
 *  @desc   delete a fAQ
 *  @access private (only admin)
 */

export async function DELETE(request: NextRequest, { params }: Props) {
    try {
      const admin = verifyToken(request);
      if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
          { message: "ليس لديك الصلاحية" },
          { status: 403 }
        );
      }
  
      const faqID = parseInt(params.id);
      const findFAQ = await prisma.fAQ.findUnique({ where: { id: faqID } });
  
      if (!findFAQ) {
        return NextResponse.json(
          { message: "هذا السؤال غير متاح" },
          { status: 404 }
        );
      }
     
      const FAQ = await deleteFAQ(faqID);
      return NextResponse.json(
        { message: "تم الحذف بنجاح", FAQ },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error delete a fAQ", error);
      return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
    }
  }
  