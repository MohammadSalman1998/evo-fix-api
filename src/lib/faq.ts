// src\lib\faq.ts
import prisma from "@/utils/db";
import { createFAQDto, UpdateFAQDto } from "@/utils/dtos";

export async function createFAQ({ question, category }: createFAQDto) {
  try {
    const FAQ = await prisma.fAQ.create({
      data: {
        question,
        answer: '',
        category,
        isPublished:false
      },
    });

    return FAQ;
  } catch (error) {
    console.log("error create FAQ", error);
    throw new Error("error create FAQ");
  }
}

export async function updateFAQ(
  id: number,
  { question, answer, category, isPublished }: UpdateFAQDto
) {
  try {
    const FAQ = await prisma.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        category,
        isPublished,
      },
    });

    return FAQ;
  } catch (error) {
    console.log("error update FAQ", error);
    throw new Error("error update FAQ");
  }
}

export async function deleteFAQ(id: number) {
  try {
    const FAQ = await prisma.fAQ.delete({
      where: { id },
    });

    return FAQ;
  } catch (error) {
    console.log("error delete FAQ", error);
    throw new Error("error delete FAQ");
  }
}


export async function getFAQ(id: number) {
  try {
    const FAQ = await prisma.fAQ.findUnique({
      where: { id, isPublished:true },
    });

    return FAQ;
  } catch (error) {
    console.log("error get FAQ", error);
    throw new Error("error get FAQ");
  }
}

export async function getAllFAQ() {
  try {
    const FAQ = await prisma.fAQ.findMany({
        where:{isPublished:true},
        orderBy:{createdAt:"desc"}
    });

    return FAQ;
  } catch (error) {
    console.log("error get all FAQ", error);
    throw new Error("error get all FAQ");
  }
}

export async function countNotPublishedFAQ() {
  try {
    const FAQ = await prisma.fAQ.count({
        where:{isPublished:false}
    });

    return FAQ;
  } catch (error) {
    console.log(error);
    throw new Error("error"+error);
  }
}

