// src\app\api\contact-us\route.ts

import { contactUs } from "@/lib/email";
import { createNotification } from "@/lib/notification";
import prisma from "@/utils/db";
import { CreateEmailDto } from "@/utils/dtos";
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
      const review = await contactUs(contactUsData);
  
      await createNotification({
        senderId: admin?.id || 0,
        recipientId: admin?.id || 0,
        title:"رسالة جديدة",
        content:`رسالة جديد بإيميل: "${contactUsData.email}" -  العنوان: "${contactUsData.subject}" - المحتوى: "${contactUsData.content}"`
      })
  
      return NextResponse.json(review, { status: 201 });
    } catch (error) {
      console.error("Error create contact us", error);
      return NextResponse.json({ message: "خطأ في السيرفر" }, { status: 500 });
    }
  }
  