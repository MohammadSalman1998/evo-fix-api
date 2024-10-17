// src\lib\email.ts
// import { CreateEmailDto,SentEmailOutDto,RecipientEmailOutDto,EmailOutDto, MailOptionsDto } from "@/utils/dtos";
import prisma from "@/utils/db";
import { MailOptionsDto,CreateEmailDto } from "@/utils/dtos";
import { Email } from "@prisma/client";
import nodemailer from 'nodemailer';

// Create a transporter object using Gmail's SMTP server
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL_APP_EVOFIX, // Sender email address from env
    pass: process.env.GOOGLE_PASSWORD_APP_EVOFIX, // App password from env
  },
});



// Function to send mail with dynamic values
export async function sendRealMail({ to , subject, text, html,requestId }: MailOptionsDto): Promise<void> {
  // Create dynamic mailOptions
  const mailOptions = {
    from: process.env.GOOGLE_EMAIL_APP_EVOFIX, // Sender address from env
    to,  // Receiver (passed as an argument)
    subject, // Subject (passed as an argument)
    text: text || '', // Plain text body (optional)
    html: html || '', // HTML body (optional)
    requestId: requestId || 0
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error while sending email:', error);
  }
}


export async function contactUs({
  email,
  subject,
  content,
  recipientId,
}: CreateEmailDto): Promise<Email> {
  try {
    const contactUsEmail = await prisma.email.create({
      data: {
        email,
        subject,
        content,
        recipientId,
      },
    });

    return contactUsEmail;
  } catch (error) {
    console.error("Error creating email of contact us:", error);
    throw new Error("Failed to create email of contact us");
  }
}

// Sender Endpoints
// export async function getSentEmails(userId: number, limit: number = 10, offset: number = 0): Promise<SentEmailOutDto[]> {
// export async function getSentEmails(userId: number): Promise<SentEmailOutDto[]> {
//   try {
//     const emails = await prisma.email.findMany({
//       where: { senderId: userId },
//       select: {
//         id: true,
//         subject: true,
//         content: true,
//         recipient:{
//           select:{
//             fullName:true,
//             address:true
//           }
//         },
//         sentAt: true,
//       },
//       orderBy: { sentAt: 'desc' },
//       // take: limit,
//       // skip: offset
//     });
//     return emails;
//   } catch (error) {
//     console.error('Error fetching sent emails:', error);
//     throw new Error('Failed to fetch sent emails');
//   }
// }

// Recipient  Endpoints
// export async function getRecipientEmails(userId: number, limit: number = 10, offset: number = 0): Promise<RecipientEmailOutDto[]> {
// export async function getRecipientEmails(userId: number): Promise<RecipientEmailOutDto[]> {
//   try {
//     const emails = await prisma.email.findMany({
//       where: { recipientId: userId },
//       select: {
//         id: true,
//         subject: true,
//         content: true,
//         sender:{
//           select:{
//             fullName:true,
//             address:true
//           }
//         },
//         sentAt: true,
//       },
//       orderBy: { sentAt: 'desc' },
//       // take: limit,
//       // skip: offset
//     });
//     return emails;
//   } catch (error) {
//     console.error('Error fetching sent emails:', error);
//     throw new Error('Failed to fetch sent emails');
//   }
// }

// // Admin Endpoints
// // export async function getAllEmails(limit: number = 10, offset: number = 0): Promise<EmailOutDto[]> {
// export async function getAllEmails(): Promise<EmailOutDto[]> {
//   try {
//     const emails = await prisma.email.findMany({
//       select: {
//         id: true,
//         subject: true,
//         content: true,
//         sender:{
//           select:{
//             fullName:true,
//             email:true
//           }
//         },
//         recipient:{
//           select:{
//             fullName:true,
//             email:true
//           }
//         },
//         sentAt: true,
//       },
//       orderBy: { sentAt: 'desc' },
//       // take: limit,
//       // skip: offset
//     });
//     return emails;
//   } catch (error) {
//     console.error('Error fetching all emails:', error);
//     throw new Error('Failed to fetch all emails');
//   }
// }

// // Sub-Admin Endpoints
// // export async function getAllEmails(limit: number = 10, offset: number = 0): Promise<EmailOutDto[]> {
// export async function getAllEmailsByGovernorate(governorate: string): Promise<EmailOutDto[]> {
//   try {
//     const emails = await prisma.email.findMany({
//       where: {
//         OR: [
//           {
//             sender: {
//               governorate: governorate
//             }
//           },
//           {
//             recipient: {
//               governorate: governorate
//             }
//           }
//         ]
//       },
//       select: {
//         id: true,
//         subject: true,
//         content: true,
//         sender:{
//           select:{
//             fullName:true,
//             email:true
//           }
//         },
//         recipient:{
//           select:{
//             fullName:true,
//             email:true
//           }
//         },
//         sentAt: true,
//       },
//       orderBy: { sentAt: 'desc' },
//       // take: limit,
//       // skip: offset
//     });
//     return emails;
//   } catch (error) {
//     console.error('Error fetching all emails:', error);
//     throw new Error('Failed to fetch all emails');
//   }
// }
