// src\app\api\contact-us\[id]\route.ts
import { ReadcontactUs } from "@/lib/email";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: {
    id: string;
  };
}

/**
 *  @method PUT
 *  @route  ~/api/contact-us/:id
 *  @desc   Read an  email of contact-us
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

    const idEmail = parseInt(params.id)
    const email = await prisma.email.findUnique({
        where:{id: idEmail}
    })

    if(!email){
        return NextResponse.json(
            { message: "هذا الايميل غير متوفر حاليا" },
            { status: 400 }
          );
    }

   const ReadEmail = await ReadcontactUs(idEmail)

   return NextResponse.json(
    { message: `تمت قراءة الايميل`, ReadEmail },
    { status: 200 }
  );
  } catch (error) {
    console.log("error update a contact-us", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
