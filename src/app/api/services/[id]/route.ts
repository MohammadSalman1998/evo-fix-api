// src\app\api\services\[id]\route.ts

import { DeleteService, GetServiceByID, updateService } from "@/lib/services";
import prisma from "@/utils/db";
import { UpdateServiceDto } from "@/utils/dtos";
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
    const body = (await request.json()) as UpdateServiceDto;

    const service = await prisma.services.findUnique({
      where: { id: serviceID },
    });

    if (!service) {
      return NextResponse.json(
        { message: "هذه الخدمة غير متوفرة" },
        { status: 400 }
      );
    }
    const data: UpdateServiceDto = {
      id: serviceID,
      title: body.title,
      isActive: body.isActive,
    };
    const serviceUpdate = await updateService(data);

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
      include:{
        DevicesModels:true
      }
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
