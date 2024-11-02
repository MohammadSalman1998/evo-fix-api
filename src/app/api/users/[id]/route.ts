// src\app\api\users\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { UpdateUserDto } from "@/utils/dtos";
import bcrypt from "bcryptjs";
import { UpdateUserSchema } from "@/utils/validationSchemas";
import { Role } from "@prisma/client";
import { sendRealMail } from "@/lib/email";
import { sendSms } from "@/lib/sms";

interface Props {
  params: { id: string };
}

/**
 *  @method GET
 *  @route  ~/api/users/[id]
 *  @desc   Get user by ID
 *  @access private (only user himself can get account Or Admin Or [subAdmin By same governorate] )
 */
export async function GET(request: NextRequest, { params }: Props) {
  const id = parseInt(params.id);

  try {
    const userFromToken = verifyToken(request);
    if (!userFromToken) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية " },
        { status: 403 }
      );
    }
    const subAdminUser = await prisma.user.findUnique({
      where: {
        id: userFromToken?.id,
      },
      select: {
        subadmin: {
          select: {
            governorate: true,
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        customer: true,
        technician: true,
        subadmin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "هذا الحساب غير موجود" },
        { status: 404 }
      );
    }
    const userResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNO: user.phoneNO,
      governorate: user.governorate,
      address: user.address,
      // avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      // customerId: user.customer?.id,
      technician_specialization: user.technician?.specialization,
      technician_services: user.technician?.services,
      admin_department: user.subadmin?.department,
      admin_governorate: user.subadmin?.governorate,
    };

    if (
      userFromToken !== null &&
      (userFromToken.id === user.id ||
        userFromToken.role === "ADMIN" ||
        (userFromToken.role === "SUBADMIN" &&
          subAdminUser?.subadmin?.governorate === user.governorate))
    ) {
      return NextResponse.json(userResponse, { status: 200 });
    }

    return NextResponse.json(
      { message: "ليس لديك الصلاحية " },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching user", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method PUT
 *  @route  ~/api/users/[id]
 *  @desc   Update user details
 *  @access private (only user himself can update account Or Admin Or [subAdmin By same governorate])
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!user) {
      return NextResponse.json(
        { message: "هذا الحساب غير موجود" },
        { status: 404 }
      );
    }
    const userFromToken = verifyToken(request);

    const body = (await request.json()) as UpdateUserDto;
    const validation = UpdateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // if (
    //   userFromToken === null ||
    //   userFromToken.id !== user.id ||
    //   userFromToken.role !== "ADMIN"
    // ) {
      
    //   return NextResponse.json(
    //     { message: "ليس لديك الصلاحية " },
    //     { status: 403 }
    //   );
    // }

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    if ((userFromToken !== null) && (userFromToken.id === user.id || userFromToken.role === "ADMIN" || userFromToken.role === "SUBADMIN")) {

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: {
        email: body.email,
        fullName: body.fullName,
        governorate: body.governorate,
        password: body.password,
        phoneNO: body.phoneNO,
        address: body.address,
        avatar: body.avatar,
        isActive:  body.isActive || user.isActive,
        role: (body.role as Role) || user.role,
        technician:
          user.role === "TECHNICAL"
            ? {
                upsert: {
                  create: {
                    specialization: body.specialization,
                    services: body.services,
                  },
                  update: {
                    specialization: body.specialization,
                    services: body.services,
                  },
                },
              }
            : undefined,
        subadmin:
          user.role === "SUBADMIN"
            ? {
                upsert: {
                  create: {
                    department: body.department,
                    governorate: body.governorateAdmin || body.governorate,
                  },
                  update: {
                    department: body.department,
                    governorate: body.governorateAdmin || body.governorate,
                  },
                },
              }
            : undefined,
      },
      include: {
        customer: true,
        technician: true,
        subadmin: true,
      },
    });

    const userResponse = {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNO: updatedUser.phoneNO,
      governorate: updatedUser.governorate,
      address: updatedUser.address,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      technician_specialization: updatedUser.technician?.specialization,
      technician_services: updatedUser.technician?.services,
      admin_department: updatedUser.subadmin?.department,
      admin_governorate: updatedUser.subadmin?.governorate,
    };

    if (
      userFromToken !== null &&
      updatedUser.isActive === true &&
      (userFromToken.role === "ADMIN" || userFromToken.role === "SUBADMIN")
    ) {
      await sendRealMail(
        {
          recipientName: user.fullName,
          mainContent: `يسرنا انضمامك لفريقنا`,
          additionalContent: `يمكنك تسجيل الدخول عبر الايميل ${user.email}`,
        },
        {
          to: user.email,
          subject: "تفعيل حساب جديد",
        }
      );
      try {
        await sendSms(`   ترحب بكم EvoFix سيد/ة ${user.fullName}
    تم تفعيل حسابك بنجاح, يمكنك تسجيل الدخول عبر الايميل ${user.email}`);
      } catch (error) {
        console.log(error);

        return NextResponse.json(
          {
            message:
              "خطأ بالوصول إلى خادم إرسال الرسائل ولكن تم تحديث الحساب بنجاح ",
            ...userResponse,
          },
          { status: 200 }
        );
      }
    }

    // if ((userFromToken !== null) && (userFromToken.id === user.id || userFromToken.role === "ADMIN" || userFromToken.role === "SUBADMIN")) {
    return NextResponse.json(
      { message: "تم تحديث الحساب بنجاح", ...userResponse },
      { status: 200 }
    );
    }else{
      return NextResponse.json(
            { message: "ليس لديك الصلاحية " },
            { status: 403 }
          );
    }
  } catch (error) {
    console.error("Error updating user", error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method DELETE
 *  @route  ~/api/users/[id]
 *  @desc   Delete user
 *  @access private (only user himself can delete his account Or Admin Or [subAdmin By same governorate])
 */

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const userFromToken = verifyToken(request);
    const subAdminUser = await prisma.user.findUnique({
      where: {
        id: userFromToken?.id,
      },
      select: {
        subadmin: {
          select: {
            governorate: true,
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        customer: true,
        technician: true,
        subadmin: true,
        maintenanceRequests: true,
        receivedEmails: true,
        receivedNotification: true,
        senderNotification: true,
        Epaid: true,
        sentSMS: true,
        receivedSMS: true,
        Review: true,
        Invoice: true
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "هذا الحساب غير موجود" },
        { status: 404 }
      );
    }

    if (
      userFromToken !== null &&
      (userFromToken.id === user.id ||
        userFromToken.role === "ADMIN" ||
        (userFromToken.role === "SUBADMIN" &&
          subAdminUser?.subadmin?.governorate === user.governorate &&
          user.role !== "SUBADMIN" &&
          user.role !== "ADMIN"))
    ) {
      await prisma.$transaction(async (prisma) => {
        // Delete all related records first
        if (user.maintenanceRequests.length > 0) {
          await prisma.maintenanceRequest.deleteMany({
            where: { customerId: user.id }
          });
        }
        
        if (user.receivedEmails.length > 0) {
          await prisma.email.deleteMany({
            where: { recipientId: user.id }
          });
        }

        if (user.receivedNotification.length > 0) {
          await prisma.notification.deleteMany({
            where: { recipientId: user.id }
          });
        }

        if (user.senderNotification.length > 0) {
          await prisma.notification.deleteMany({
            where: { senderId: user.id }
          });
        }

        if (user.Epaid.length > 0) {
          await prisma.epaid.deleteMany({
            where: { senderId: user.id }
          });
        }

        if (user.sentSMS.length > 0) {
          await prisma.sMS.deleteMany({
            where: { senderId: user.id }
          });
        }

        if (user.receivedSMS.length > 0) {
          await prisma.sMS.deleteMany({
            where: { recipientId: user.id }
          });
        }

        if (user.Review.length > 0) {
          await prisma.review.deleteMany({
            where: { userId: user.id }
          });
        }

        if (user.Invoice.length > 0) {
          await prisma.invoice.deleteMany({
            where: { userId: user.id }
          });
        }

        // Delete related entities
        if (user.customer) {
          await prisma.customer.delete({ where: { id: user.customer.id } });
        }
        if (user.technician) {
          await prisma.technician.delete({ where: { id: user.technician.id } });
        }
        if (user.subadmin) {
          await prisma.sUBADMIN.delete({ where: { id: user.subadmin.id } });
        }

        // Finally, delete the user
        await prisma.user.delete({ where: { id: parseInt(params.id) } });
      });

      try {
        await sendRealMail(
          {
            recipientName: user.fullName,
            mainContent: `لقد تم حذف حسابك نهائيا من المنصة`,
            additionalContent: `يمكنك  إخبار المسؤول بذلك عبر الايميل ${process.env.GOOGLE_EMAIL_APP_EVOFIX}`,
          },
          {
            to: user.email,
            subject: "حذف حساب",
          }
        );
      } catch (emailError) {
        console.error("Error sending delete confirmation email:", emailError);
        // Continue with the response even if email fails
      }

      return NextResponse.json(
        { message: "تم حذف الحساب بنجاح" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "ليس لديك الصلاحية " },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ 
      message: "خطأ من الخادم",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


