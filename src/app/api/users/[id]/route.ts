// src\app\api\users\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import { UpdateUserDto } from "@/utils/dtos";
import bcrypt from "bcryptjs";
import { UpdateUserSchema } from "@/utils/validationSchemas";



interface Props {
  params: { id: string };
}

/**
 *  @method GET
 *  @route  ~/api/users/[id]
 *  @desc   Get user by ID
 *  @access private (only user himself can get account )
 */
export async function GET(request: NextRequest, { params }: Props) {
  const id = parseInt(params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        governorate:true,
        email: true,
        phoneNO: true,
        address: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "هذا الحساب غير موجود" },
        { status: 404 },
      );
    }
    const userFromToken = verifyToken(request);

    if (userFromToken === null || userFromToken.id !== user.id) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية " },
        { status: 403 },
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error fetching Data', error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method PUT
 *  @route  ~/api/users/[id]
 *  @desc   Update user details
 *  @access private (only user himself can update account or Admin)
 */
export async function PUT(request: NextRequest, { params }: Props) {
 
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!user) {
      return NextResponse.json(
        { message: "هذا الحساب غير موجود" },
        { status: 404 },
      );
    }
    const userFromToken = verifyToken(request);
    if (userFromToken === null || userFromToken.id !== user.id) {
      return NextResponse.json(
        { message: "ليس لديك الصلاحية " },
        { status: 403 },
      );
    }

    const body = (await request.json()) as UpdateUserDto;
    const validation = UpdateUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    if(body.password){
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: {
        email: body.email,
        fullName: body.fullName,
        governorate:body.governorate,
        password: body.password,
        phoneNO: body.phoneNO,
        address: body.address,
        avatar: body.avatar,
      },
      select: {
        id: true,
        fullName: true,
        governorate:true,
        email: true,
        phoneNO: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser,{status: 200})
  } catch (error) {
    console.error('Error fetching Data', error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}

/**
 *  @method DELETE
 *  @route  ~/api/users/[id]
 *  @desc   Delete user
 *  @access private (only user himself can delete his account Or Admin)
 */
export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(params.id) },
        });
        if (!user) {
          return NextResponse.json(
            { message: "هذا الحساب غير موجود" },
            { status: 404 },
          );
        }
    
        const userFromToken = verifyToken(request);
    
        if (
          (userFromToken !== null && userFromToken.id === user.id) ||
          (userFromToken !== null && userFromToken.role === "ADMIN")
        ) {
          await prisma.user.delete({ where: { id: parseInt(params.id) } });
          return NextResponse.json(
            { message: "تم حذف الحساب بنجاح" },
            { status: 200 },
          );
        }
        return NextResponse.json(
          { message: "ليس لديك الصلاحية " },
          { status: 403 },
        );
      } catch (error) {
        console.error('Error fetching Data', error);
        return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
      }
}
