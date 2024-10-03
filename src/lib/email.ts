// src\lib\email.ts
import prisma from "@/utils/db";
import { CreateEmailDto,SentEmailOutDto,RecipientEmailOutDto,EmailOutDto } from "@/utils/dtos";
import { Email } from "@prisma/client";



export async function sendEmail({
  subject,
  content,
  senderId,
  recipientId,
}: CreateEmailDto): Promise<Email> {
  try {
    const email = await prisma.email.create({
      data: {
        subject,
        content,
        senderId,
        recipientId,
      },
    });

    return email;
  } catch (error) {
    console.error("Error creating email:", error);
    throw new Error("Failed to create email");
  }
}

// Sender Endpoints
// export async function getSentEmails(userId: number, limit: number = 10, offset: number = 0): Promise<SentEmailOutDto[]> {
export async function getSentEmails(userId: number): Promise<SentEmailOutDto[]> {
  try {
    const emails = await prisma.email.findMany({
      where: { senderId: userId },
      select: {
        id: true,
        subject: true,
        content: true,
        recipient:{
          select:{
            fullName:true,
            address:true
          }
        },
        sentAt: true,
      },
      orderBy: { sentAt: 'desc' },
      // take: limit,
      // skip: offset
    });
    return emails;
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    throw new Error('Failed to fetch sent emails');
  }
}

// Recipient  Endpoints
// export async function getRecipientEmails(userId: number, limit: number = 10, offset: number = 0): Promise<RecipientEmailOutDto[]> {
export async function getRecipientEmails(userId: number): Promise<RecipientEmailOutDto[]> {
  try {
    const emails = await prisma.email.findMany({
      where: { recipientId: userId },
      select: {
        id: true,
        subject: true,
        content: true,
        sender:{
          select:{
            fullName:true,
            address:true
          }
        },
        sentAt: true,
      },
      orderBy: { sentAt: 'desc' },
      // take: limit,
      // skip: offset
    });
    return emails;
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    throw new Error('Failed to fetch sent emails');
  }
}

// Admin Endpoints
// export async function getAllEmails(limit: number = 10, offset: number = 0): Promise<EmailOutDto[]> {
export async function getAllEmails(): Promise<EmailOutDto[]> {
  try {
    const emails = await prisma.email.findMany({
      select: {
        id: true,
        subject: true,
        content: true,
        sender:{
          select:{
            fullName:true,
            email:true
          }
        },
        recipient:{
          select:{
            fullName:true,
            email:true
          }
        },
        sentAt: true,
      },
      orderBy: { sentAt: 'desc' },
      // take: limit,
      // skip: offset
    });
    return emails;
  } catch (error) {
    console.error('Error fetching all emails:', error);
    throw new Error('Failed to fetch all emails');
  }
}

// Sub-Admin Endpoints
// export async function getAllEmails(limit: number = 10, offset: number = 0): Promise<EmailOutDto[]> {
export async function getAllEmailsByGovernorate(governorate: string): Promise<EmailOutDto[]> {
  try {
    const emails = await prisma.email.findMany({
      where: {
        OR: [
          {
            sender: {
              governorate: governorate
            }
          },
          {
            recipient: {
              governorate: governorate
            }
          }
        ]
      },
      select: {
        id: true,
        subject: true,
        content: true,
        sender:{
          select:{
            fullName:true,
            email:true
          }
        },
        recipient:{
          select:{
            fullName:true,
            email:true
          }
        },
        sentAt: true,
      },
      orderBy: { sentAt: 'desc' },
      // take: limit,
      // skip: offset
    });
    return emails;
  } catch (error) {
    console.error('Error fetching all emails:', error);
    throw new Error('Failed to fetch all emails');
  }
}
