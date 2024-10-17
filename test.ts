
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