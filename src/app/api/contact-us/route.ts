// src\app\api\contact-us\route.ts

import { contactUs, getAllContactUsEmails } from "@/lib/email";
import { createNotification } from "@/lib/notification";
import prisma from "@/utils/db";
import { CreateEmailDto } from "@/utils/dtos";
import { verifyToken } from "@/utils/verifyToken";
import { NextRequest, NextResponse } from "next/server";


/**
 *  @method POST
 *  @route  ~/api/contact-us
 *  @desc   create new email of contact-us
 *  @access public
 */

export async function POST(request: NextRequest) {
    try {

  
      const admin = await prisma.user.findFirst({where:{role:"ADMIN"}})
      const body = (await request.json()) as CreateEmailDto;

      const contactUsData: CreateEmailDto = {
        email:body.email,
        subject: body.subject,
        content: body.content,
        recipientId: admin?.id || 0
      };
      const emailContactUs = await contactUs(contactUsData);
  
      await createNotification({
        senderId: admin?.id || 0,
        recipientId: admin?.id || 0,
        title:"رسالة جديدة",
        content:`رسالة جديد بإيميل: "${contactUsData.email}" -  العنوان: "${contactUsData.subject}" - المحتوى: "${contactUsData.content}"`
      })
  
      return NextResponse.json(emailContactUs, { status: 201 });
    } catch (error) {
      console.error("Error create contact us", error);
      return NextResponse.json({ message: "خطأ في السيرفر" }, { status: 500 });
    }
  }
  

  /**
 *  @method GET
 *  @route  ~/api/contact-us
 *  @desc   get all contact-us
 *  @access private (only admin)
 */

export async function GET(request: NextRequest) {
    try {
      const account = verifyToken(request);
      if (!account) {
        return NextResponse.json(
          { message: "قم بتسجيل الدخول أولاً" },
          { status: 403 }
        );
      }
  
  
      if (account.role === "ADMIN") {
        const adminContactUs = await getAllContactUsEmails();
        if(adminContactUs){

            return NextResponse.json({ adminContactUs }, { status: 200 });
        }else{
            return NextResponse.json({message: "لا توجد مراسلات حاليا" }, { status: 200 });

        }
      }
  

      return NextResponse.json(
        { message: "ليس لديك الصلاحية" },
        { status: 403 }
      );
    } catch (error) {
      console.error("Error fetching Reviews", error);
      return NextResponse.json(
        { message: "خطأ في جلب البيانات " },
        { status: 500 }
      );
    }
  }
  