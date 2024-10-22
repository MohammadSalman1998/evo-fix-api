// src\app\api\device-models\[id]\route.ts
import { deleteDeviceModel, updateDeviceModel } from "@/lib/services";
import prisma from "@/utils/db";
import { UpdateModelsDto } from "@/utils/dtos";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: {
    id: string;
  };
}

/**
 *  @method PUT
 *  @route  ~/api/device-models/:id
 *  @desc   update a device-models
 *  @access private (only user Admin )
 */

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const devicemodelID = parseInt(params.id);
    const admin = verifyToken(request);
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }
    const body = (await request.json()) as UpdateModelsDto;

    const devicemodel = await prisma.devicesModels.findUnique({
      where: { id: devicemodelID },
    });

    if (!devicemodel) {
      return NextResponse.json(
        { message: "هذا الموديل غير متوفر" },
        { status: 400 }
      );
    }
    const data: UpdateModelsDto = {
      serviceID: body.serviceID,
      title: body.title,
      isActive: body.isActive,
    };
    const devicemodelUpdate = await updateDeviceModel(devicemodelID, data);

    return NextResponse.json(
      { message: `تم تعديل الموديل بنجاح`, devicemodelUpdate },
      { status: 200 }
    );
  } catch (error) {
    console.log("error update a devicemodel", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}


/**
 *  @method DELETE
 *  @route  ~/api/device-models/:id
 *  @desc   DELETE a device-models
 *  @access private (only user Admin )
 */

export async function DELETE(request: NextRequest, { params }: Props) {
    try {
      const devicemodelID = parseInt(params.id);
      const admin = verifyToken(request);
      if (!admin || admin.role !== "ADMIN") {
        return NextResponse.json(
          { message: "ليس لديك الصلاحية" },
          { status: 403 }
        );
      }
  
      const devicemodel = await prisma.devicesModels.findUnique({
        where: { id: devicemodelID },
      });
  
      if (!devicemodel) {
        return NextResponse.json(
          { message: "هذا الموديل غير متوفر" },
          { status: 400 }
        );
      }

      const devicemodeldelete = await deleteDeviceModel(devicemodelID);
  
      return NextResponse.json(
        { message: `تم حذف الموديل بنجاح`, devicemodeldelete },
        { status: 200 }
      );
    } catch (error) {
      console.log("error delete a devicemodel", error);
      return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
    }
  }
  

  /**
 *  @method GET
 *  @route  ~/api/device-models/:id
 *  @desc   get a device-models by id
 *  @access public
 */

// export async function Get(request: NextRequest, { params }: Props) {
//     try {
//       const devicemodelID = parseInt(params.id);
//       const user = verifyToken(request);
//     if (!user) {
//       return NextResponse.json(
//         { message: "قم بتسجيل الدخول أولا" },
//         { status: 403 }
//       );
//     }

  
//       const devicemodel = await prisma.devicesModels.findUnique({
//         where: { id: devicemodelID },
//       });
  
//       if (!devicemodel) {
//         return NextResponse.json(
//           { message: "هذا الموديل غير متوفر" },
//           { status: 400 }
//         );
//       }

//       const getdevicemodel = await getDeviceModelById(devicemodelID);
  
//       return NextResponse.json(
//         { getdevicemodel },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.log("error get a devicemodel", error);
//       return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
//     }
//   }