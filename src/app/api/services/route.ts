// src\app\api\services\route.ts

import { createServices, GetAllServices } from "@/lib/services";
import prisma from "@/utils/db";
import { CreateServiceDto } from "@/utils/dtos";
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
    const body = (await request.json()) as CreateServiceDto;

    const data: CreateServiceDto = { title: body.title };

    const service = await createServices(data);
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

export async function GET(request: NextRequest) {
  try {
    const getCountServices = await prisma.services.count({
      where: { isActive: true },
    });

    if (getCountServices < 1) {
      return NextResponse.json(
        { message: "لا يوجد خدمات بعد" },
        { status: 404 }
      );
    }

    const services = await GetAllServices();

    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.log("error get all services", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
