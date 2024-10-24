// src\app\api\services\[id]\route.ts

import { DeleteService, GetServiceByID } from "@/lib/services";
import prisma from "@/utils/db";
import { UpdateServiceDto } from "@/utils/dtos";
import { uploadImage } from "@/utils/uploadImage";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: {
    id: string;
  };
}

/**
 *  @method PUT
 *  @route  ~/api/services/:id
 *  @desc   update a service
 *  @access private (only user Admin )
 */

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const serviceID = parseInt(params.id);
    const admin = verifyToken(request);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }
    const formData = await request.formData();
    const body: Partial<UpdateServiceDto> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
    };

    const Active = formData.get("isActive") as string;
    const image = formData.get("serviceImage") as File | null;

    const service = await prisma.services.findUnique({
      where: { id: serviceID },
    });

    let serviceImageURL = service?.serviceImage;
    if (image && image instanceof File) {
      const imageBuffer = await image.arrayBuffer();
      serviceImageURL = await uploadImage(Buffer.from(imageBuffer));
    }

    if (!service) {
      return NextResponse.json(
        { message: "هذه الخدمة غير متوفرة" },
        { status: 400 }
      );
    }


    let isActive = true;
    if (Active && Active === "false" || Active === "False" || Active === "FALSE") {
      isActive = false;
    } else if (Active && Active === "true" || Active === "True" || Active === "TRUE") {
      isActive = true;
    }

    const serviceUpdate = await prisma.services.update({
      where: { id: serviceID },
      data: {
        title: body.title || service.title,
        description: body.description || service.description,
        serviceImage: serviceImageURL,
        isActive
      },
    });

    return NextResponse.json(
      { message: `تم تعديل الخدمة بنجاح`, serviceUpdate },
      { status: 200 }
    );
  } catch (error) {
    console.log("error update a service", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method get
 *  @route  ~/api/services/:id
 *  @desc   get a service
 *  @access public
 */

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const serviceID = parseInt(params.id);
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولا" },
        { status: 403 }
      );
    }

    const service = await prisma.services.findUnique({
      where: { id: serviceID },
    });

    if (!service) {
      return NextResponse.json(
        { message: "هذه الخدمة غير متوفرة" },
        { status: 400 }
      );
    }

    const getservice = await GetServiceByID(serviceID);

    return NextResponse.json({ getservice }, { status: 200 });
  } catch (error) {
    console.log("error find a service", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method delete
 *  @route  ~/api/services/:id
 *  @desc   delete a service
 *  @access private (only admin)
 */

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const serviceID = parseInt(params.id);

    const admin = verifyToken(request);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }

    const service = await prisma.services.findUnique({
      where: { id: serviceID },
      include: {
        DevicesModels: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { message: "هذه الخدمة غير متوفرة" },
        { status: 400 }
      );
    }

    const deleteservice = await DeleteService(serviceID);

    return NextResponse.json(
      { message: "تم حذف الخدمة بنجاح", deleteservice },
      { status: 200 }
    );
  } catch (error) {
    console.log("error delete a service", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
