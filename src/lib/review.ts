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
          rating:true,
          comment:true,
          user:{
            select:{
                fullName:true,
                email:true,
                phoneNO:true
            }
          }
        },
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
          rating:true,
          comment:true,
          user:{
            select:{
                fullName:true,
                email:true,
                phoneNO:true
            }
          }
        },
      });
  
      return AllReviewsByGovernorate;
    } catch (error) {
      console.error("Error get all reviews By Governorate:", error);
      throw new Error("Failed to get all reviews By Governorate");
    }
  }