// src\app\api\review\[id]\route.ts

import {
  updateReviewActive,
} from "@/lib/review";
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