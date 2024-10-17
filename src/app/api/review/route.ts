// src\app\api\review\route.ts

import {
  createReview,
  getAllReviews,
  getAllReviewsByGovernorate,
} from "@/lib/review";
import prisma from "@/utils/db";
import { createReviewDto } from "@/utils/dtos";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

/**
 *  @method POST
 *  @route  ~/api/review
 *  @desc   create new review
 *  @access private (only user himself registered can create review)
 */

export async function POST(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 403 }
      );
    }
    const body = (await request.json()) as createReviewDto;
    const reviewData: createReviewDto = {
      userId: account.id,
      rating: body.rating,
      comment: body.comment,
    };
    const review = await createReview(reviewData);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error create review", error);
    return NextResponse.json({ message: "خطأ في السيرفر" }, { status: 500 });
  }
}

/**
 *  @method GET
 *  @route  ~/api/review
 *  @desc   get all review
 *  @access private (only admin or [subAdmin by same governorate)
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

    const admin = await prisma.user.findUnique({
      where: { id: account?.id, role: "ADMIN" },
    });

    const subAdmin = await prisma.user.findUnique({
      where: { id: account?.id, role: "SUBADMIN" },
      select: {
        subadmin: {
          select: {
            governorate: true,
          },
        },
      },
    });

    if (admin) {
      const adminReviews = await getAllReviews();
      return NextResponse.json({ adminReviews }, { status: 200 });
    }
    if (subAdmin) {
      const subAdminReviews = await getAllReviewsByGovernorate(
        subAdmin.subadmin?.governorate || ""
      );

      return NextResponse.json({ subAdminReviews }, { status: 200 });
    }
    return NextResponse.json(
      { messasge: "ليس لديك الصلاحية" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching Reviews", error);
    return NextResponse.json(
      { message: "خطأ في جلب البيانات " },
      { status: 500 }
    );
  }
}
