// src\lib\email.ts
// import { CreateEmailDto,SentEmailOutDto,RecipientEmailOutDto,EmailOutDto, MailOptionsDto } from "@/utils/dtos";
import { HOME_EVOFIX } from "@/utils/constants";
import prisma from "@/utils/db";
import { MailOptionsDto,CreateEmailDto,EmailTemplateProps } from "@/utils/dtos";
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
export async function sendRealMail({recipientName, mainContent, additionalContent,seconderyContent}:EmailTemplateProps,{ to , subject, text,requestId }: MailOptionsDto): Promise<void> {
  // Create dynamic mailOptions
  const email_html = getEmailTemplate({
    recipientName,
    mainContent,
    additionalContent,
    seconderyContent
  })
  const mailOptions = {
    from: process.env.GOOGLE_EMAIL_APP_EVOFIX, // Sender address from env
    to,  // Receiver (passed as an argument)
    subject, // Subject (passed as an argument)
    text: text || '', // Plain text body (optional)
    requestId: requestId || 0,
    html: email_html || '', // HTML body (optional)
  };

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error while sending email:', error);
  }
}


export const getEmailTemplate = ({
  recipientName = '',
  mainContent,
  additionalContent = '',
  seconderyContent = '',
}: EmailTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
            background-color: #414441;
        }
        .logo img {
            width: 200px;
            height: auto;
        }
        .header {
            background-color: #2e56f7;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            text-align: center;
        }
        .header-text{
            color: #f5f5f5;
        }
        .content {
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        h1 {
            color: #757373;
            margin: 10px 0;
            font-size: 24px;
        }
        h2 {
            color: #161f42;
            margin: 15px 0;
            font-size: 20px;
        }
        h3 {
            color: #008422;
            margin: 10px 0;
            font-size: 18px;
            text-align: center;
        }
        .goHome{
            text-align: center;
            margin-top: 50px;
        }
        .btn{
            text-decoration: none;
            color: #2e56f7;
            font-size: 20px;
            text-align: center;
            
            padding: 10px;
            border-radius: 20px;
            background-color: transparent;
            border: #2e56f7 1px solid;
        }
        .btn:hover{
            background-color: #2e56f7;
            cursor: pointer;
            color: white;
        }
        .footer {
            text-align: center;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            font-size: 14px;
            color: #666;
        }
    </style>
    </head>
    <body>
        <div class="email-container" dir="rtl">
            <div class="logo">
                <img src="https://res.cloudinary.com/dnzzud7om/image/upload/v1729100782/EvoFix-Requests-Images/ycq0zy3sza9edtwsunlz.png" alt="logo">
            </div>
            
            <div class="header">
                <h1 class="header-text">مرحبا بكم في منصتنا الخدمية EvoFix</h1>
            </div>
            
            <div class="content">
                ${recipientName ? `<h1>سيد/ة ${recipientName}</h1>` : ''}
                <h3>${mainContent}</h3>
                ${additionalContent ? `<h2>${additionalContent}</h2>` : ''}
                <div class="goHome">
                <h3>${seconderyContent}</h3>
                <a class="btn" href=${HOME_EVOFIX}>العودة للمنصة >>></a>
            </div>
            </div>
            
            <div class="footer">
                <p>شكراً لكم على استخدام منصة EvoFix</p>
                <p>هذا البريد الإلكتروني تم إرساله تلقائياً - الرجاء عدم الرد عليه</p>
            </div>
        </div>
    </body>
    </html>
  `;
};


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
export async function getAllContactUsEmails() {
  try {
    const allContactUs = await prisma.email.findMany({
      select: {
        id: true,
        email:true,
        subject: true,
        content: true,
        sentAt: true,
      },
      orderBy: { sentAt: 'desc' },
      // take: limit,
      // skip: offset
    });
    return allContactUs;
  } catch (error) {
    console.error('Error fetching sent emails:', error);
    throw new Error('Failed to fetch sent emails');
  }
}

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
