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
    if(!userFromToken){
      return NextResponse.json(
        { message: "ليس لديك الصلاحية " },
        { status: 403 }
      );
    }
      const subAdminUser = await prisma.user.findUnique({
        where:{
          id: userFromToken?.id
        },
        select:{
          subadmin:{
            select:{
              governorate: true
            }
          }
        }
      })

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
    


    if ((userFromToken !== null) && ((userFromToken.id === user.id || userFromToken.role === "ADMIN") || (userFromToken.role === "SUBADMIN") && subAdminUser?.subadmin?.governorate === user.governorate)) {

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

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

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
        isActive: user.role === "ADMIN"? body.isActive : false,
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


  const activeTechAccount_mail = {
    to: user.email, 
    subject: 'حساب تقني جديد', 
    html: ` 
    <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h1>سيد/ة ${user.fullName}</h1>
      <h3>يسعدنا انضمامك لفريقنا</h3>
      <h2>لقد تم تفعيل حسابك بنجاح</h2>
      <b>يمكنك تسجيل الدخول عبر الايميل ${user.email}</b>
    </div>
  ` 
  };

  if(userFromToken !== null && updatedUser.isActive === true && (userFromToken.role === "ADMIN" ||  userFromToken.role === "SUBADMIN" )){
    sendRealMail(activeTechAccount_mail)
    sendSms(`   ترحب بكم EvoFix سيد/ة ${user.fullName}
       تم تفعيل حسابك بنجاح`)

  }

  if ((userFromToken !== null) && (userFromToken.id === user.id || userFromToken.role === "ADMIN" || userFromToken.role === "SUBADMIN")) {
    return NextResponse.json(
      {  message: "تم تحديث الحساب بنجاح" , ...userResponse},
      { status: 200 }
    );
  }


  return NextResponse.json(
    { message: "ليس لديك الصلاحية " },
    { status: 403 }
  );

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
      where:{
        id: userFromToken?.id
      },
      select:{
        subadmin:{
          select:{
            governorate: true
          }
        }
      }
    })

    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
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

    const deleteAccount_mail = {
      to: user.email, 
      subject: 'حذف حساب', 
      html: ` 
      <div dir="rtl">
        <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
        <h1>سيد/ة ${user.fullName}</h1>
        <h3>لقد تم حذف حسابك نهائيا من المنصة</h3>
        <h2>ان كان هناك خطأ ما </h2>
        <b>يمكنك  إخبار المسؤول بذلك عبر الايميل mohammad.salman.m1998@gmail.com</b>
      </div>
    ` 
    };
    

    if ((userFromToken !== null) && ((userFromToken.id === user.id || userFromToken.role === "ADMIN") || (userFromToken.role === "SUBADMIN" && subAdminUser?.subadmin?.governorate === user.governorate && user.role !== "SUBADMIN" && user.role !== "ADMIN"))) {
      await prisma.$transaction(async (prisma) => {
        // Delete related entities first
        if (user.customer) {
            await prisma.customer.delete({ where: { id: user.customer.id } });
        }
        if (user.technician) {
            await prisma.technician.delete({ where: { id: user.technician.id } });
        }
        if (user.subadmin) {
            await prisma.sUBADMIN.delete({ where: { id: user.subadmin.id } });
        }

        sendRealMail(deleteAccount_mail)
        // Finally, delete the user
        await prisma.user.delete({ where: { id: parseInt(params.id) } });
    });

  


      // await prisma.user.delete({ where: { id: parseInt(params.id) } });
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
    console.error("Error deleting user" ,error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
