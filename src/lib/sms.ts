// src\lib\sms.ts
import { NextResponse } from "next/server";
import twilio from "twilio";
import { newLocalSMS } from "@/utils/dtos";
import prisma from "@/utils/db";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendSms = async (message: string) => {
  try {
    const result = await client.messages.create({
      body: message,
      messagingServiceSid: process.env.TWILIO_MESSAGEING_SERVICE_SID,
      to: "+963958329660",
    });
    console.log("SMS sent successfully:", result.sid);
    return result;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

export const smsReceive = async () => {
  try {
    // جلب الرسائل الواردة من Twilio
    const messages = await client.messages.list({ limit: 10 });

    // عرض الرسائل في الرد
    NextResponse.json(
      messages.map((msg) => ({
        from: msg.from,
        body: msg.body,
        dateSent: msg.dateSent,
      }))
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Error fetching messages" },
      { status: 500 }
    );
  }
};

export  async function sendSmsLocal({
  content,
  senderId,
  recipientId,
  requestId = null,
  operationNumber,
  amount = 0,
  typePaid,
}: newLocalSMS) {
  try {
    const localSMS = await prisma.sMS.create({
      data:{
        content,
        senderId,
        recipientId,
        requestId,
        operationNumber,
        amount,
        typePaid,
      }
    })
    return localSMS
  } catch (error) {
    console.error("Error creating sendSmsLocal:", error);
    throw new Error("Failed to create sendSmsLocal");
  }
};
