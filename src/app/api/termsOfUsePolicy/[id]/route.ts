// src\app\api\termsOfUsePolicy\[id]\route.ts
import { updateTermsPolicy, getTermsPolicy,deleteTermsPolicy } from "@/lib/termsOfUsePolicy";
import prisma from "@/utils/db";
import { updateTermsOfUsePolicyDto } from "@/utils/dtos";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: {
    id: string;
  };
}

/**
 *  @method GET
 *  @route  ~/api/termsOfUsePolicy/:id
 *  @desc   get a termsOfUsePolicy
 *  @access public
 */

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const TermPolicyId = parseInt(params.id);

    const term = await prisma.termsOfUsePolicy.findUnique({
      where: { id: TermPolicyId },
    });

    if (!term) {
      return NextResponse.json(
        { message: "هذا الطلب غير متاح" },
        { status: 404 }
      );
    }

    const TermsPolicy = await getTermsPolicy(TermPolicyId);
    return NextResponse.json({ TermsPolicy }, { status: 200 });
  } catch (error) {
    console.error("Error get termsPolicy", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method PUT
 *  @route  ~/api/termsOfUsePolicy/:id
 *  @desc   update a termsOfUsePolicy
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
    const TermPolicyId = parseInt(params.id);

    const term = await prisma.termsOfUsePolicy.findUnique({
      where: { id: TermPolicyId },
    });

    if (!term) {
      return NextResponse.json(
        { message: "هذا الطلب غير متاح" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as updateTermsOfUsePolicyDto;
    const data: updateTermsOfUsePolicyDto = {
      version: body.version,
      title: body.title,
      content: body.content,
      isActive: body.isActive
    };

    const TermsPolicy = await updateTermsPolicy(TermPolicyId,data);
    return NextResponse.json({message: "تم التعديل بنجاح", TermsPolicy }, { status: 200 });
  } catch (error) {
    console.error("Error update a termsPolicy", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method DELETE
 *  @route  ~/api/termsOfUsePolicy/:id
 *  @desc   delete a termsOfUsePolicy
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
      const TermPolicyId = parseInt(params.id);
  
      const term = await prisma.termsOfUsePolicy.findUnique({
        where: { id: TermPolicyId },
      });
  
      if (!term) {
        return NextResponse.json(
          { message: "هذا الطلب غير متاح" },
          { status: 404 }
        );
      }
  
      const TermsPolicy = await deleteTermsPolicy(TermPolicyId);
      return NextResponse.json({message: "تم الحذف بنجاح", TermsPolicy }, { status: 200 });
    } catch (error) {
      console.error("Error delete a termsPolicy", error);
      return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
    }
  }
