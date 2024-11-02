// src\app\api\review\route.ts

import { createNotification } from "@/lib/notification";
import {
  createReview,
  getAllReviews,
  getAllReviewsActive,
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

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const body = (await request.json()) as createReviewDto;
    const oldRivew = await prisma.review.findFirst({
      where: {userId:account.id}
    })
    const reviewData: createReviewDto = {
      userId: account.id,
      rating: body.rating,
      comment: body.comment,
    };
    if(!oldRivew){
      const review = await createReview(reviewData);
  
      await createNotification({
        senderId: account.id,
        recipientId: admin?.id || 0,
        title: "تقييم جديد",
        content: `تقييم جديد باسم: "${account.fullName}" - درجة التقييم: "${review.rating}" - التعليق: "${review.comment}"`,
      });
  
      return NextResponse.json(review, { status: 201 });
    }else{
      const updateReview = await prisma.review.update({
        where:{id:oldRivew.id,userId: account.id},
        data:{
          rating: reviewData.rating,
          comment: reviewData.comment,
          isActive:false
        }
      })

      await createNotification({
        senderId: account.id,
        recipientId: admin?.id || 0,
        title: "تعديل تقييم",
        content: `تعديل تقييم باسم: "${account.fullName}" - درجة التقييم: "${updateReview.rating}" - التعليق: "${updateReview.comment}"`,
      });
  
      return NextResponse.json(updateReview, { status: 201 });
    }
   
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
    // if (!account || ) {
    //   const allReviews = await getAllReviewsActive();
    //   return NextResponse.json({ allReviews }, { status: 200 });
    // }

    if(account){
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
    }
    const allReviews = await getAllReviewsActive();
      return NextResponse.json({ allReviews }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Reviews", error);
    return NextResponse.json(
      { message: "خطأ في جلب البيانات " },
      { status: 500 }
    );
  }
}
