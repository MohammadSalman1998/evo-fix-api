// src\app\api\users\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import bcrypt from "bcryptjs";
import { setTokenCookie } from "@/utils/generateToken";
import { RegisterUserDto } from "@/utils/dtos";
import { RegisterUserSchema } from "@/utils/validationSchemas";
/**
 *  @method GET
 *  @route  ~/api/users
 *  @desc   Get all users
 *  @access private (only admin can show all users) 
 */
export async function GET(request: NextRequest) {
    try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            fullName: true,
            governorate:true,
            email: true,
            phoneNO: true,
            address: true,
            isActive: true,
          }
        });
        const adminToken = verifyToken(request);
    
        if (adminToken !== null && adminToken.role === "ADMIN"){
    
          return NextResponse.json(users, { status: 200 });
        }else{
          return NextResponse.json({message: "ليس ليك الصلاحية"}, { status: 403 });
    
        }
        
    
      } catch (error) {
        console.error('Error fetching technicians:', error);
        return NextResponse.json({ message: "خطأ في جلب البيانات " }, { status: 500 });
      }
}

/**
 *  @method POST
 *  @route  ~/api/users
 *  @desc   Create a new user
 *  @access public
 */
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as RegisterUserDto;
        const validation = RegisterUserSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { message: validation.error.errors[0].message },
            { status: 400 },
          );
        }
    
        const user = await prisma.user.findUnique({
          where: {
            email: body.email,
          },
        });
        if (user) {
          return NextResponse.json(
            { message: "هذا الحساب موجود مسبقا" },
            { status: 400 },
          );
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
    
        const newUser = await prisma.user.create({
          data: {
            email: body.email,
            governorate: body.governorate,
            fullName: body.fullName,
            password: hashedPassword,
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
    
        const cookie = setTokenCookie({
          id: newUser.id,
          role: newUser.role,
          fullName: newUser.fullName,
        });
    
        return NextResponse.json(
          { ...newUser, message: "تم تسجيل الحساب بنجاح" },
          { status: 201, headers: { "Set-Cookie": cookie } },
        );
    
      } catch (error) {
        return NextResponse.json({error, message: "خطأ من الخادم" }, { status: 500 });
      }
}
