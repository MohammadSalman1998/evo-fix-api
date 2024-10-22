// src\app\api\maintenance-requests\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendRealMail } from "@/lib/email";
import { Role } from "@prisma/client";
import { UpdateMaintenance_RequestDto } from "@/utils/dtos";
import { updateRequest } from "@/lib/requests";

/**
 *  @method DELETE
 *  @route  ~/api/maintenance-requests/:id
 *  @desc   Delete the  maintenance request
 *  @access private (TECH - ADMIN - SUBADMIN By Governorate)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 403 }
      );
    }

    const requestId = parseInt(params.id);

    const subAdminUser = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        subadmin: {
          select: {
            governorate: true,
          },
        },
      },
    });

    const maintenanceOrder = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        governorate: true,
        customerId: true,
        technicianId: true,
        user: {
          select: {
            governorate: true,
          },
        },
      },
    });

    if (!maintenanceOrder) {
      return NextResponse.json(
        { message: "هذا الطلب غير متاح" },
        { status: 404 }
      );
    }

    if (
      user.id !== maintenanceOrder?.customerId &&
      user.role !== Role.ADMIN &&
      user.role !== Role.SUBADMIN &&
      user.role !== Role.TECHNICAL
    ) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 403 }
      );
    }

    if (
      user.role === Role.SUBADMIN &&
      maintenanceOrder?.user.governorate !== subAdminUser?.subadmin?.governorate
    ) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 403 }
      );
    }

    if (
      user.role === Role.TECHNICAL &&
      maintenanceOrder?.technicianId !== user.id
    ) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية بهذا الطلب" },
        { status: 403 }
      );
    }

    const maintenanceRequest = await prisma.maintenanceRequest.delete({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            governorate: true,
          },
        },
        technician: {
          select: {
            user: {
              select: {
                id: true,
                fullName: true,
                governorate: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const maintenance = {
      RequestID: maintenanceRequest.id,
      deviceType: maintenanceRequest.deviceType,
      problemDescription: maintenanceRequest.problemDescription,
      cost: maintenanceRequest.cost,
      isPaid: maintenanceRequest.isPaid,
      status: maintenanceRequest.status,
      costumerID: maintenanceRequest.user.id,
      costumerName: maintenanceRequest.user.fullName,
      costumerGovernorate: maintenanceRequest.user.governorate,
    };

    // Send email to the technician
    if (maintenanceRequest.technician && maintenanceRequest.technician.user) {
      // Create notification for the technician
      await createNotification({
        recipientId: maintenanceRequest.technician?.user.id,
        senderId: user.id,
        title: "حذف طلب صيانة",
        content: `تم حذف الطلب من قائمة الطلبات  ${maintenance.deviceType}`,
      });

      await sendRealMail(
        {
          recipientName: maintenanceRequest.technician?.user.fullName,
          mainContent: `تم حذف الطلب من قائمة الطلبات ${maintenance.deviceType}`,
        },
        {
          to: maintenanceRequest.technician.user.email,
          subject: " حذف طلب صيانة",
        }
      );
    }

    await createNotification({
      recipientId: user.id,
      senderId: user.id,
      title: "حذف طلب صيانة",
      content: `تم حذف الطلب من قائمة الطلبات  ${maintenance.deviceType}`,
    });

    return NextResponse.json({
      message: "تم حذف الطلب بنجاح ",
      request: maintenance,
    });
  } catch (error) {
    console.error("Error Delete order", error);
    return NextResponse.json({ message: " خطأ من الخادم " }, { status: 500 });
  }
}

/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id
 *  @desc   update the  maintenance request
 *  @access private ( ADMIN - SUBADMIN By Governorate)
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = verifyToken(request);
    const requestId = parseInt(params.id);
    const requestMaint = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
    });
    const user = await prisma.user.findUnique({
      where: { id: account?.id },
    });

    if (
      !account ||
      account.role === Role.USER ||
      account.role === Role.TECHNICAL
    ) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }

    if (
      account.role === Role.SUBADMIN &&
      user?.governorate !== requestMaint?.governorate
    ) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as UpdateMaintenance_RequestDto;

    const data: UpdateMaintenance_RequestDto = {
      deviceType: body.deviceType,
      deviceModel: body.deviceModel,
      governorate: body.governorate,
      phoneNO: body.phoneNO,
      address: body.address,
      problemDescription: body.problemDescription,
      status: body.status,
      cost: body.cost,
      resultCheck: body.resultCheck,
      isPaid: body.isPaid,
      isPaidCheckFee: body.isPaidCheckFee,
    };

    const RequestUpdatting = await updateRequest(requestId, data);
    return NextResponse.json(
      { message: "تم التعديل بنجاح", RequestUpdatting },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error update order", error);
    return NextResponse.json({ message: " خطأ من الخادم " }, { status: 500 });
  }
}
