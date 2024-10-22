// src\lib\termsOfUsePolicy.ts
import prisma from "@/utils/db";
import {
  createTermsOfUsePolicyDto,
  updateTermsOfUsePolicyDto,
} from "@/utils/dtos";

export async function createTermsPolicy({
  version,
  title,
  content,
}: createTermsOfUsePolicyDto) {
  try {
    const TermsPolicy = await prisma.termsOfUsePolicy.create({
      data: {
        version,
        title,
        content,
      },
    });

    return TermsPolicy;
  } catch (error) {
    console.log("error create terms police", error);
    throw new Error("error create terms police");
  }
}

export async function updateTermsPolicy(
  id: number,
  { version, title, content, isActive }: updateTermsOfUsePolicyDto
) {
  try {
    const updateTermsPolicy = await prisma.termsOfUsePolicy.update({
      where: { id },
      data: {
        version,
        title,
        content,
        isActive,
      },
    });

    return updateTermsPolicy;
  } catch (error) {
    console.log("error update terms police", error);
    throw new Error("error update terms police");
  }
}

export async function getTermsPolicy(id: number) {
  try {
    const TermsPolicy = await prisma.termsOfUsePolicy.findUnique({
      where: { id },
    });

    return TermsPolicy;
  } catch (error) {
    console.log("error get a terms police", error);
    throw new Error("error get a terms police");
  }
}

export async function deleteTermsPolicy(id: number) {
  try {
    const TermsPolicy = await prisma.termsOfUsePolicy.delete({
      where: { id },
    });

    return TermsPolicy;
  } catch (error) {
    console.log("error delete a terms police", error);
    throw new Error("error delete a terms police");
  }
}
