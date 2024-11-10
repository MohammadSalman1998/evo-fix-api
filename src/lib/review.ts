// src\lib\review.ts

import prisma from "@/utils/db";
import { createReviewDto } from "@/utils/dtos";


export async function createReview({
    userId,
    rating,
    comment
  }: createReviewDto) {
    try {
      const review = await prisma.review.create({
        data: {
          userId,
          rating,
          comment
        },
      });
  
  
      return review;
    } catch (error) {
      console.error("Error creating review:", error);
      throw new Error("Failed to create review");
    }
  }


  export async function getAllReviews() {
    try {
      const AllReviews = await prisma.review.findMany({
        select: {
          id:true,
          rating:true,
          comment:true,
          isActive:true,
          user:{
            select:{
                fullName:true,
                email:true,
                phoneNO:true
            }
          }
        },
        orderBy:{createdAt:"desc"}
      });
  
      return AllReviews;
    } catch (error) {
      console.error("Error get all reviews:", error);
      throw new Error("Failed to get all reviews");
    }
  }

  export async function getAllReviewsByGovernorate(governorate: string) {
    try {
      const AllReviewsByGovernorate = await prisma.review.findMany({
        where:{user:{governorate}},
        select: {
          id:true,
          rating:true,
          comment:true,
          isActive:true,
          user:{
            select:{
                fullName:true,
                email:true,
                phoneNO:true
            }
          }
        },
        orderBy:{createdAt:"desc"}
      });
  
      return AllReviewsByGovernorate;
    } catch (error) {
      console.error("Error get all reviews By Governorate:", error);
      throw new Error("Failed to get all reviews By Governorate");
    }
  }

export async function updateReviewActive(id: number){
  try {
    const updateReview = await prisma.review.update({
      where:{id},
     data:{
      isActive:true
     }
    });

    return updateReview;
  } catch (error) {
    console.error("Error update review:", error);
    throw new Error("Failed to update review");
  }
}

export async function getAllReviewsActive(){
  try {
    const AllReviews = await prisma.review.findMany({
      where:{isActive:true},
      select: {
        id:true,
        rating:true,
        comment:true,
        isActive:true,
        user:{
          select:{
              fullName:true,
          }
        }
      },
      orderBy:{createdAt:"desc"}
    });

    return AllReviews;
  } catch (error) {
    console.error("Error get all reviews:", error);
    throw new Error("Failed to get all reviews");
  }
}

export async function deleteReview(id:number){
  try {
    const Review = await prisma.review.delete({
      where:{id},
    });

    return Review;
  } catch (error) {
    console.error("Error delete review:", error);
    throw new Error("Failed to delete review");
  }
}
