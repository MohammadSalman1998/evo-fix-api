// // src/app/api/users/register/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/utils/db";
// import { sendRealMail } from "@/lib/email"; // تأكد من أن لديك وظيفة لإرسال البريد الإلكتروني
// import jwt from "jsonwebtoken";

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password } = await request.json();

//     // التحقق من وجود المستخدم
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return NextResponse.json({ message: "هذا البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
//     }

//     // إنشاء المستخدم
//     const user = await prisma.user.create({
//       data: { email, password }, // تأكد من تشفير كلمة المرور
//     });

//     // إنشاء رمز التحقق
//     const secret = process.env.JWT_SECRET + user.password;
//     const token = jwt.sign({ id: user.id }, secret, { expiresIn: "15m" });

//     // رابط التحقق
//     const verificationLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/verify-email?token=${token}&id=${user.id}`;

//     // إرسال البريد الإلكتروني
//     await sendRealMail({
//       recipientName: email,
//       mainContent: "تحقق من بريدك الإلكتروني",
//       additionalContent: `انقر <a href="${verificationLink}">هنا</a> للتحقق من بريدك الإلكتروني.`
//     }, {
//       to: email,
//       subject: 'تحقق من بريدك الإلكتروني',
//     });

//     return NextResponse.json({ message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" }, { status: 200 });

//   } catch (error) {
//     console.error("Error during registration:", error);
//     return NextResponse.json({ message: "فشل تسجيل الحساب" }, { status: 500 });
//   }
// }



















































// src/lib/email/types.ts
// export interface EmailTemplateProps {
//     subject: string;
//     recipientName?: string;
//     mainContent: string;
//     additionalContent?: string;
//   }
  
//   // src/lib/email/templates.ts
//   export const getEmailTemplate = ({
//     recipientName = '',
//     mainContent,
//     additionalContent = '',
//   }: EmailTemplateProps) => {
//     return `
//       <!DOCTYPE html>
//       <html dir="rtl" lang="ar">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <style>
//               body {
//                   margin: 0;
//                   padding: 0;
//                   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                   background-color: #f5f5f5;
//               }
//               .email-container {
//                   max-width: 600px;
//                   margin: 0 auto;
//                   background-color: #ffffff;
//                   padding: 20px;
//                   border-radius: 8px;
//                   box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//               }
//               .logo {
//                   text-align: center;
//                   margin-bottom: 20px;
//               }
//               .logo svg {
//                   width: 200px;
//                   height: auto;
//               }
//               .header {
//                   background-color: #4a6cf7;
//                   color: white;
//                   padding: 15px;
//                   border-radius: 6px;
//                   margin-bottom: 20px;
//                   text-align: center;
//               }
//               .content {
//                   padding: 20px;
//                   background-color: #f8f9fa;
//                   border-radius: 6px;
//                   margin-bottom: 20px;
//               }
//               h1 {
//                   color: #333;
//                   margin: 10px 0;
//                   font-size: 24px;
//               }
//               h2 {
//                   color: #4a6cf7;
//                   margin: 15px 0;
//                   font-size: 20px;
//               }
//               h3 {
//                   color: #008422;
//                   margin: 10px 0;
//                   font-size: 18px;
//               }
//               .footer {
//                   text-align: center;
//                   padding: 15px;
//                   background-color: #f8f9fa;
//                   border-radius: 6px;
//                   font-size: 14px;
//                   color: #666;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="email-container">
//               <div class="logo">
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1486.17 805.54">
//                       <!-- Your SVG content here -->
//                       <path class="cls-3" d="m1484.58,407.74c-1.73-.52-3.71-.21-5.58-.21-25.02.06-50.04.17-75.05.18-6.56,0-13.12-.29-19.68-.42-5.11-.1-8.61,2.1-11.57,6.47-8.25,12.18-17.07,23.97-25.48,36.05-2.52,3.62-5.27,5.64-9.96,5.62-27.55-.16-55.11-.12-82.66.01-4.55.02-7.55-1.7-10.14-5.38-14.97-21.24-30.01-42.44-45.27-63.47-3.12-4.3-2.9-7.26.22-11.54,14.75-20.24,29.23-40.69,43.54-61.24,3.58-5.14,7.71-7.32,14.05-7.25,25.99.3,51.98.35,77.96.02,6.48-.08,10.37,2.34,13.82,7.5,7.31,10.92,15.38,21.35,22.61,32.32,3.84,5.83,8.24,8.2,15.41,8.1,29.74-.41,59.49-.12,89.24-.22,3.29-.01,6.58-.88,9.87-1.36-1.43-3.02-2.5-6.27-4.33-9.02-26.47-39.93-53.18-79.69-79.43-119.76-3.93-6-8.03-8.25-15.16-8.22-59.18.29-118.36.43-177.54-.04-10.5-.08-17.06,2.79-22.86,11.88-15.17,23.74-31.5,46.73-47.31,70.06-2.92,4.32-5.94,7.26-11.97,7.23-57.93-.21-115.85-.07-173.78-.12-7.86,0-8.01-.32-5.06-8.02,14.19-37.15,28.5-74.24,42.63-111.41,3.88-10.2,7.29-20.58,10.91-30.87h0c.16-.6.31-1.21.47-1.81-.21.56-.42,1.12-.62,1.68,0,0,.04.04.08.07l-.08-.07c-1.59,1.87-3.44,3.57-4.72,5.63-29.26,47.44-58.44,94.92-87.66,142.38-17.23,28-34.54,55.95-51.72,83.98-4.84,7.91-4.53,8.35,4.96,8.39,27.01.13,54.01.01,81.02.01-2.67,2.91-4.21,4.76-5.93,6.43-33.63,32.79-67.33,65.49-100.9,98.34-39.16,38.33-78.18,76.8-117.3,115.17-25.26,24.77-50.67,49.39-75.85,74.24-13.47,13.3-26.59,26.95-39.87,40.45,1.8-.89,3.73-1.61,5.3-2.8,57.85-43.91,115.68-87.85,173.49-131.81,57.57-43.77,115.15-87.54,172.65-131.4,5.38-4.11,10.71-6.65,17.89-6.61,50.72.3,101.45.28,152.17.03,6.75-.03,10.77,2.28,14.47,7.85,16.48,24.76,33.53,49.15,50.06,73.87,3.51,5.25,7.39,7.35,13.8,7.32,61.06-.22,122.12-.23,183.17.06,7.18.03,11.33-2.4,15.2-8.3,26.67-40.55,53.69-80.88,80.6-121.28,1.21-1.82,2.65-3.58,3.4-5.59.3-.81-.73-2.94-1.54-3.18Z"/>
//                   </svg>
//               </div>
              
//               <div class="header">
//                   <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
//               </div>
              
//               <div class="content">
//                   ${recipientName ? `<h1>سيد/ة ${recipientName}</h1>` : ''}
//                   <h3>${mainContent}</h3>
//                   ${additionalContent ? `<h2>${additionalContent}</h2>` : ''}
//               </div>
              
//               <div class="footer">
//                   <p>شكراً لكم على استخدام خدمات EvoFix</p>
//                   <p>هذا البريد الإلكتروني تم إرساله تلقائياً - الرجاء عدم الرد عليه</p>
//               </div>
//           </div>
//       </body>
//       </html>
//     `;
//   };
  
//   // src/lib/email/sendEmail.ts
//   import nodemailer from 'nodemailer';
  
//   interface SendEmailProps extends EmailTemplateProps {
//     to: string;
//     requestId?: string;
//   }
  
//   export const sendEmail = async ({
//     to,
//     subject,
//     recipientName,
//     mainContent,
//     additionalContent,
//     requestId
//   }: SendEmailProps) => {
//     try {
//       const transporter = nodemailer.createTransport({
//         // قم بإضافة إعدادات SMTP الخاصة بك هنا
//         host: process.env.SMTP_HOST,
//         port: parseInt(process.env.SMTP_PORT || '587'),
//         secure: process.env.SMTP_SECURE === 'true',
//         auth: {
//           user: process.env.SMTP_USER,
//           pass: process.env.SMTP_PASSWORD,
//         },
//       });
  
//       const html = getEmailTemplate({
//         recipientName,
//         mainContent,
//         additionalContent,
//         subject,
//       });
  
//       const mailOptions = {
//         from: process.env.SMTP_FROM_EMAIL,
//         to,
//         subject,
//         html,
//         ...(requestId && { headers: { 'X-Request-ID': requestId } }),
//       };
  
//       const info = await transporter.sendMail(mailOptions);
//       return { success: true, messageId: info.messageId };
//     } catch (error) {
//       console.error('Error sending email:', error);
//       throw new Error('Failed to send email');
//     }
//   };
  
//   // مثال على استخدام النظام في API route
//   // src/app/api/maintenance/route.ts
//   import { NextResponse } from 'next/server';
//   import { sendEmail } from '@/lib/email/sendEmail';
  
//   export async function POST(req: Request) {
//     try {
//       const data = await req.json();
//       const { technician, contentData, title, requestId } = data;
  
//       await sendEmail({
//         to: technician.email,
//         subject: title,
//         recipientName: technician.fullName,
//         mainContent: 'يوجد طلب صيانة جديد مناسب لك',
//         additionalContent: contentData,
//         requestId,
//       });
  
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       console.error('Error in maintenance request:', error);
//       return NextResponse.json(
//         { error: 'Failed to process maintenance request' },
//         { status: 500 }
//       );
//     }
//   }
  
//   // مثال على استخدام آخر للنظام (مثلاً لإرسال رسالة ترحيب)
//   // src/app/api/welcome/route.ts
//   export async function POST(req: Request) {
//     try {
//       const { user } = await req.json();
  
//       await sendEmail({
//         to: user.email,
//         subject: 'مرحباً بك في EvoFix',
//         recipientName: user.fullName,
//         mainContent: 'نرحب بك في منصتنا',
//         additionalContent: 'نتمنى لك تجربة ممتعة ومفيدة',
//       });
  
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       console.error('Error sending welcome email:', error);
//       return NextResponse.json(
//         { error: 'Failed to send welcome email' },
//         { status: 500 }
//       );
//     }
//   }
















































// src\lib\notification.ts
// import prisma from "@/utils/db";
// import { CreateNotificationDto, notificationOutDto } from "@/utils/dtos";
// import { Notification } from '@prisma/client';
// import { sendToUser } from "../websocket-server";


// export async function createNotification({
//   senderId,
//   recipientId,
//   title = "title",
//   content,
//   metadata = {}, 
// }: CreateNotificationDto & { metadata?: { [key: string]: string | number | boolean } }): Promise<Notification> {
//   try {
//     const fullContent = JSON.stringify({
//       message: content,
//       metadata, // Include the metadata object
//     });

//     const notification = await prisma.notification.create({
//       data: {
//         senderId,
//         recipientId,
//         title,
//         content: fullContent,
//       }
//     });

//     sendToUser(recipientId, {
//       type: "NEW_NOTIFICATION",
//       data: {
//         recipientId,
//         title,
//         content,
//         createdAt: new Date(),
//       },
//     });

//     return notification;
//   } catch (error) {
//     console.error('Error creating notification:', error);
//     throw new Error('Failed to create notification');
//   }
// }



// export async function markNotificationAsRead(notificationId: number,userId: number): Promise<notificationOutDto> {
//   try {
//     const updatedNotification = await prisma.notification.update({
//       where: { id: notificationId, recipientId:userId },
//       data: { isRead: true },
//       select:{
//         id:true,
//         content:true,
//         title: true,
//         createdAt:true,
//       },
//     });

//     return updatedNotification;
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     throw new Error('Failed to mark notification as read');
//   }
// }


// // export async function getUserNotifications(userId: number, limit: number = 10, offset: number = 0): Promise<notificationOutDto[]> {
// export async function getUserNotifications(userId: number): Promise<notificationOutDto[]> {
//   try {
//     const notifications = await prisma.notification.findMany({
//       where: { recipientId: userId },
//       select:{
//         id:true,
//         recipientId:true,
//         senderId:true,
//         title:true,
//         content:true,
//         createdAt:true,
//         isRead:true,
//       },
//       orderBy: { createdAt: 'desc' },
//       // take: limit,
//       // skip: offset
//     });

//     return notifications.map((notification) => {
//       let parsedContent;
    
//       // Safely parse the content with error handling
//       try {
//         parsedContent = JSON.parse(notification.content);
//       } catch (error) {
//         console.error('Error parsing notification content:', error);
//         parsedContent = {
//           message: notification.content,  // Fall back to the raw content if JSON parsing fails
//           metadata: {},                   // Use an empty object for metadata if not present
//         };
//       }
    
//       return {
//         ...notification,
//         content: parsedContent.message || notification.content,  // Use parsed message or original content
//         metadata: parsedContent.metadata || {},  // Use parsed metadata or empty object
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching user notifications:', error);
//     throw new Error('Failed to fetch user notifications');
//   }
// }











































// // src\app\api\maintenance-requests\route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from "@/utils/db";
// // import { Role, RequestStatus } from '@prisma/client';
// // import { sendEmail } from '@/lib/email';
// // import { createNotification } from '@/lib/notification';
// // import { MaintenanceRequestSchema } from '@/utils/validationSchemas';
// import { verifyToken } from "@/utils/verifyToken";
// // import { CreateMaintenance_RequestDto } from '@/utils/dtos';

// import mime from "mime";
// import { join } from "path";
// import { stat, mkdir, writeFile } from "fs/promises";
// import { uploadImage } from '@/utils/uploadImage';


// /**
//  *  @method POST
//  *  @route  ~/api/maintenance-requests
//  *  @desc   Create a new maintenance request + create notifications for all Technicians
//  *  @access public (user)
//  */
// export async function POST(request: NextRequest) {


//   try {
//     const user = verifyToken(request);
//     if (!user) {
//       return NextResponse.json(
//         { message: "قم بتسجيل الدخول أولاً" },
//         { status: 403 },
//       );
//     }











//     const formData = await request.formData();

//     // const body = await request.json() as CreateMaintenance_RequestDto;
//     // Assume we have a validation schema
//     // const validation = MaintenanceRequestSchema.safeParse(formData);
//     // if (!validation.success) {
//     //   return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
//     // }


//     const image = formData.get("deviceImage") as File || "";
//     const governorate = formData.get("governorate") as string ;
//     const phoneNO = formData.get("phoneNO") as string ;
//     const address = formData.get("address") as string ;
//     const deviceType = formData.get("deviceType") as string ;
//     const deviceModel = formData.get("deviceModel") as string ;
//     const problemDescription = formData.get("problemDescription") as string ;


//     if(governorate === "" || phoneNO === "" || address === "" || deviceType === "" || deviceModel === "" || problemDescription === ""){
//       return NextResponse.json(
//         { error: "هناك حقل فارغ" },
//         { status: 400 }
//       );
//     }

//     let fileUrl = ""
//    // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     // let sss;
  
//    if(image){
//      const buffer = Buffer.from(await image.arrayBuffer());
//      await uploadImage(buffer)
//     const relativeUploadDir = `/uploads/${new Date(Date.now())
//       .toLocaleDateString("id-ID", {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//       })
//       .replace(/\//g, "-")}`;
  
//     const uploadDir = join(process.cwd(), "public", relativeUploadDir);
  
//     try {
//       await stat(uploadDir);
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (e: any) {
//       if (e.code === "ENOENT") {
//         // This is for checking the directory is exist (ENOENT : Error No Entry)
//         await mkdir(uploadDir, { recursive: true });
//       } else {
//         console.error(
//           "Error while trying to create directory when uploading a file\n",
//           e
//         );
//         return NextResponse.json(
//           { error: "خطأ برفع الصورة" },
//           { status: 500 }
//         );
//       }
//     }
  
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const filename = `${image.name.replace(
//         /\.[^/.]+$/,
//         ""
//       )}-${uniqueSuffix}.${mime.extension(image.type)}`;
//       await writeFile(`${uploadDir}/${filename}`, buffer);
      
//        fileUrl = `${relativeUploadDir}/${filename}`;
//     }
  

//     const newRequest = await prisma.maintenanceRequest.create({
//       data: {
//         customerId: user.id,
//         governorate,
//         phoneNO,
//         address,
//         deviceType,
//         deviceModel,
//         deviceImage: fileUrl ,
//         problemDescription,
//         // governorate: body.governorate,
//         // phoneNO: body.phoneNO,
//         // address: body.address,
//         // deviceType: body.deviceType,
//         // deviceModel: body.deviceModel,
//         // deviceImage: imageUrl,
//         // problemDescription: body.problemDescription,
//       },
//     });

//     // Send notification to all technicians
//     // const technicians = await prisma.user.findMany({
//     //   where: { role: Role.TECHNICAL, isActive:true, technician:{specialization: body.deviceType}, governorate: body.governorate },
//     // });

//     // const notificationNewOrderData = {
//     //   title: "طلب صيانة جديد",
//     //   deviceType: `نوع الجهاز: ${newRequest.deviceType}`,
//     //   governorate: `المحافظة: ${newRequest.governorate}`,
//     // };


//     // for (const technician of technicians) {
//     //   await createNotification({
//     //     recipientId: technician.id,
//     //     senderId: user.id,
//     //     title: notificationNewOrderData.title,
//     //     content: `${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}`,
//     //   });

//     //   await sendRealMail({
//     //     to: technician.email,
//     //     subject:notificationNewOrderData.title ,
//     //     html: ` 
//     //     <div dir="rtl">
//     //       <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
//     //       <h1>سيد/ة ${technician.fullName}</h1>
//     //       <h3>هناك طلب صيانة جديد يمكنك الدخول الى حسابك لمعرفة التفاصيل</h3>
//     //       <h2>${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}</h2>
//     //     </div>
//     //   ` 
//     //   })
//     // }
  
//     return NextResponse.json({ message: "تم إنشاء طلب الصيانة بنجاح", request: newRequest }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating maintenance request", error);
//     return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
//   }
// }














































// import { NextRequest, NextResponse } from 'next/server';
// import prisma from "@/utils/db";
// import { Role } from '@prisma/client';
// import { createNotification } from '@/lib/notification';
// import { MaintenanceRequestSchema } from '@/utils/validationSchemas';
// import { verifyToken } from "@/utils/verifyToken";
// import { CreateMaintenance_RequestDto } from '@/utils/dtos';
// import { sendRealMail } from '@/lib/email';
// import cloudinary from '@/configs/cloudinary';

// /**
//  *  @method POST
//  *  @route  ~/api/maintenance-requests
//  *  @desc   Create a new maintenance request + create notifications for all Technicians
//  *  @access public (user)
//  */
// export async function POST(request: NextRequest) {
//   try {
//     const user = verifyToken(request);
//     if (!user) {
//       return NextResponse.json(
//         { message: "قم بتسجيل الدخول أولاً" },
//         { status: 403 },
//       );
//     }
//     const body = await request.json() as CreateMaintenance_RequestDto;

//     // Validate input schema
//     const validation = MaintenanceRequestSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
//     }

//     // Upload the image to Cloudinary
//     let uploadedImageUrl = null;
//     if (body.deviceImage) {
//       const uploadResponse = await cloudinary.uploader.upload(body.deviceImage, {
//         folder: 'maintenance-requests',
//       });

//       uploadedImageUrl = uploadResponse.secure_url; // URL of the uploaded image
//     }

//     // Create the new maintenance request
//     const newRequest = await prisma.maintenanceRequest.create({
//       data: {
//         customerId: user.id,
//         governorate: body.governorate,
//         phoneNO: body.phoneNO,
//         address: body.address,
//         deviceType: body.deviceType,
//         deviceModel: body.deviceModel,
//         deviceImage: body.deviceImage, // Save the Cloudinary URL in the database
//         problemDescription: body.problemDescription,
//       },
//     });

//     // Send notification to all technicians
//     const technicians = await prisma.user.findMany({
//       where: { role: Role.TECHNICAL, isActive: true, technician: { specialization: body.deviceType }, governorate: body.governorate },
//     });

//     const notificationNewOrderData = {
//       title: "طلب صيانة جديد",
//       deviceType: `نوع الجهاز: ${newRequest.deviceType}`,
//       governorate: `المحافظة: ${newRequest.governorate}`,
//     };

//     for (const technician of technicians) {
//       await createNotification({
//         recipientId: technician.id,
//         senderId: user.id,
//         title: notificationNewOrderData.title,
//         content: `${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}`,
//       });

//       await sendRealMail({
//         to: technician.email,
//         subject: notificationNewOrderData.title,
//         html: ` 
//           <div dir="rtl">
//             <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
//             <h1>سيد/ة ${technician.fullName}</h1>
//             <h3>هناك طلب صيانة جديد يمكنك الدخول الى حسابك لمعرفة التفاصيل</h3>
//             <h2>${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}</h2>
//           </div>
//         `,
//       });
//     }

//     return NextResponse.json({ message: "تم إنشاء طلب الصيانة بنجاح", request: newRequest }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating maintenance request", error);
//     return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
//   }
// }















































// // src/app/api/maintenance-requests/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from "@/utils/db";
// import { Role } from '@prisma/client';
// import { createNotification } from '@/lib/notification';
// import { MaintenanceRequestSchema } from '@/utils/validationSchemas';
// import { verifyToken } from "@/utils/verifyToken";
// import { CreateMaintenance_RequestDto } from '@/utils/dtos';
// import { sendRealMail } from '@/lib/email';
// import { v2 as cloudinary } from 'cloudinary';
// import { Readable } from 'stream';

// // Конфигурация Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Функция для загрузки изображения в Cloudinary
// async function uploadToCloudinary(file: Buffer): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       { folder: 'maintenance-requests' },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result!.secure_url);
//       }
//     );

//     const readableStream = new Readable();
//     readableStream.push(file);
//     readableStream.push(null);
//     readableStream.pipe(uploadStream);
//   });
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = verifyToken(request);
//     if (!user) {
//       return NextResponse.json(
//         { message: "قم بتسجيل الدخول أولاً" },
//         { status: 403 },
//       );
//     }

//     const formData = await request.formData();
//     const body = Object.fromEntries(formData) as CreateMaintenance_RequestDto & { image: File };

//     // Validate the request body
//     const validation = MaintenanceRequestSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
//     }

//     // Handle image upload
//     let deviceImageUrl = '';
//     if (body.image) {
//       const imageBuffer = await body.image.arrayBuffer();
//       deviceImageUrl = await uploadToCloudinary(Buffer.from(imageBuffer));
//     }

//     const newRequest = await prisma.maintenanceRequest.create({
//       data: {
//         customerId: user.id,
//         governorate: body.governorate,
//         phoneNO: body.phoneNO,
//         address: body.address,
//         deviceType: body.deviceType,
//         deviceModel: body.deviceModel,
//         deviceImage: deviceImageUrl,
//         problemDescription: body.problemDescription,
//       },
//     });

//     // Send notification to all technicians
//     const technicians = await prisma.user.findMany({
//       where: { role: Role.TECHNICAL, isActive: true, technician: { specialization: body.deviceType }, governorate: body.governorate },
//     });

//     const notificationNewOrderData = {
//       title: "طلب صيانة جديد",
//       deviceType: `نوع الجهاز: ${newRequest.deviceType}`,
//       governorate: `المحافظة: ${newRequest.governorate}`,
//     };

//     for (const technician of technicians) {
//       await createNotification({
//         recipientId: technician.id,
//         senderId: user.id,
//         title: notificationNewOrderData.title,
//         content: `${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}`,
//       });

//       await sendRealMail({
//         to: technician.email,
//         subject: notificationNewOrderData.title,
//         html: ` 
//         <div dir="rtl">
//           <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
//           <h1>سيد/ة ${technician.fullName}</h1>
//           <h3>هناك طلب صيانة جديد يمكنك الدخول الى حسابك لمعرفة التفاصيل</h3>
//           <h2>${notificationNewOrderData.deviceType} - ${notificationNewOrderData.governorate}</h2>
//         </div>
//       `
//       })
//     }

//     return NextResponse.json({ message: "تم إنشاء طلب الصيانة بنجاح", request: newRequest }, { status: 201 });
//   } catch (error) {
//     console.error("Error creating maintenance request", error);
//     return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };