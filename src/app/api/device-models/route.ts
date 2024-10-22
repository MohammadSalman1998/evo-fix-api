// src\app\api\device-models\route.ts
import { createDeviceModel, GetAllDeviceModel} from "@/lib/services";
import prisma from "@/utils/db";
import { CreateModelsDto } from "@/utils/dtos";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

/**
 *  @method POST
 *  @route  ~/api/device-models
 *  @desc   create new device-models
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
    const body = (await request.json()) as CreateModelsDto;

    const data: CreateModelsDto = { serviceID:body.serviceID,title: body.title };

    const device_model = await createDeviceModel(data);
    return NextResponse.json(
      { message: `تم إضافة موديل جديد بعنوان ${body.title}`, device_model },
      { status: 201 }
    );
  } catch (error) {
    console.log("error create a device-models", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}


/**
 *  @method GET
 *  @route  ~/api/device-models
 *  @desc   get all device-models
 *  @access public
 */

export async function GET() {
    try {
      const getCountdevicemodels = await prisma.devicesModels.count({
        where: { isActive: true },
      });
  
      if (getCountdevicemodels < 1) {
        return NextResponse.json(
          { message: "لا يوجد موديلات بعد" },
          { status: 404 }
        );
      }
  
      const DeviceModel = await GetAllDeviceModel();
  
      return NextResponse.json({ DeviceModel }, { status: 200 });
    } catch (error) {
      console.log("error get aaa DeviceModel", error);
      return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
    }
  }
  