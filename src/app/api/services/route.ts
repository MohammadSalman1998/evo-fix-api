// src\app\api\services\route.ts

import { GetAllServices } from "@/lib/services";
import prisma from "@/utils/db";
import { CreateServiceDto } from "@/utils/dtos";
import { uploadImage } from "@/utils/uploadImage";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

/**
 *  @method POST
 *  @route  ~/api/services
 *  @desc   create new service
 *  @access private (only user Admin )
 */


export async function POST(request: NextRequest) {
  try {
    const admin = verifyToken(request);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const body: Partial<CreateServiceDto> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
    };

    const image = formData.get("serviceImage") as File | null;

    if (
      body.title === null ||
      body.description === null
    ) {
      return NextResponse.json({ message: "هناك حقل فارغ" }, { status: 400 });
    }

    let serviceImageURL = "https://res.cloudinary.com/dnzzud7om/image/upload/v1729771563/EvoFix-Requests-Images/pbeesp8odpuf5njtkiov.jpg"
    if (image && image instanceof File) {
      const imageBuffer = await image.arrayBuffer();
      serviceImageURL = await uploadImage(Buffer.from(imageBuffer));
    }

    const oldService = await prisma.services.findFirst({
      where:{title: body.title}
    })

    if(oldService){
      return NextResponse.json({message: "هذه الخدمة موجودة بالفعل"},{status:400})
    }

    const service = await prisma.services.create({
      data:{
        title: body.title!,
        description: body.description!,
        serviceImage:serviceImageURL
      }
    })
    return NextResponse.json(
      { message: `تم إضافة خدمة جديدة بعنوان ${body.title}`, service },
      { status: 201 }
    );
  } catch (error) {
    console.log("error create a service", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method GET
 *  @route  ~/api/services
 *  @desc   get all services
 *  @access public
 */

export async function GET() {
  try {
    const getCountServices = await prisma.services.count({
      where: { isActive: true },
    });

    if (getCountServices < 1) {
      return NextResponse.json(
        { message: "لا يوجد خدمات بعد" },
        { status: 200 }
      );
    }

    const services = await GetAllServices();

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.log("error get all services", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
