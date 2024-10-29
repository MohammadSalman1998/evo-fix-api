// src\app\api\review\[id]\route.ts

import {
  deleteReview,
  updateReviewActive,
} from "@/lib/review";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";


interface Props {
    params: { id: string };
  }


/**
 *  @method PUT
 *  @route  ~/api/review/:id
 *  @desc   update  review to be activate
 *  @access private (only admin or [subAdmin by same governorate)
 */

export async function PUT(request: NextRequest, {params}:Props) {
    try {
      const account = verifyToken(request);
      if (!account) {
        return NextResponse.json(
          { message: "قم بتسجيل الدخول أولاً" },
          { status: 403 }
        );
      }

      const reviewID = parseInt(params.id)
  
      if (account.role === "ADMIN") {
        const updateReview = await updateReviewActive(reviewID);
        return NextResponse.json({ updateReview }, { status: 200 });
      }
  
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    } catch (error) {
      console.error("Error update Reviews", error);
      return NextResponse.json(
        { message: "خطأ في السيرفر" },
        { status: 500 }
      );
    }
  }

  /**
 *  @method DELETE
 *  @route  ~/api/review/:id
 *  @desc   delete  review 
 *  @access private (only admin or [subAdmin by same governorate)
 */

export async function DELETE(request: NextRequest, {params}:Props) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 403 }
      );
    }

    const reviewID = parseInt(params.id)

    const review = await prisma.review.findUnique({where:{id: reviewID}})
if(!review){
  return NextResponse.json(
    { message: "هذا التقيم غير متوفر" },
    { status: 400 }
  );
}
    if (account.role === "ADMIN") {
      const deleteReviewById = await deleteReview(reviewID);
      return NextResponse.json({message: "تم حذف التقييم بنجاح" ,deleteReviewById }, { status: 200 });
    }

    return NextResponse.json(
      { message: "ليس لديك الصلاحية" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error delete Review", error);
    return NextResponse.json(
      { message: "خطأ في السيرفر" },
      { status: 500 }
    );
  }
}