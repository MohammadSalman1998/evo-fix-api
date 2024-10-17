// src\app\api\sms\route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { sendSmsLocal } from "@/lib/sms";
import { verifyToken } from "@/utils/verifyToken";
import { newLocalSMS } from "@/utils/dtos";

/**
 *  @method POST
 *  @route  ~/api/sms
 *  @desc   Create a new SMS with content parsing
 *  @access public (user)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "الرجاء تسجيل الدخول " },
        { status: 403 }
      );
    }

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    
    const body = (await request.json()) as newLocalSMS;
  
    const amountStr = extractAmount(body.content);
    const operationNumberStr = extractOperationNumber(body.content);

    const amount = amountStr ? parseFloat(amountStr) : null;
    const operationNumber = operationNumberStr ? parseInt(operationNumberStr) : null;


    if (!amount || !operationNumber) {
      return NextResponse.json(
        { message: "القيمة المدخلة غير صالحة" },
        { status: 400 }
      );
    }
    let recipientId = user.id;
    if (admin) {
      recipientId = admin.id;
    }
    
    
    
     await sendSmsLocal({
      content: body.content,
      senderId: user.id,
      recipientId,
      operationNumber,
      amount,
      typePaid: body.typePaid,
    });

    return NextResponse.json(
      { message: "SMS sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in SMS API:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * Utility function to extract the amount from the content.
 */
function extractAmount(content: string): string | null {
  const amountMatch = content.match(/مبلغ\s(\d+)\sل\.س/); // Matches the pattern like "مبلغ 30000 ل.س"
  return amountMatch ? amountMatch[1] : null;
}

/**
 * Utility function to extract the operation number from the content.
 */
function extractOperationNumber(content: string): string | null {
  const operationNumberMatch = content.match(/رقم العملية هو\s(\d+)/); // Matches the pattern like "رقم العملية هو 600133048281"
  return operationNumberMatch ? operationNumberMatch[1] : null;
}
