// src\app\api\maintenance-requests\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendEmail, sendRealMail } from "@/lib/email";
import { Role } from "@prisma/client";


/**
 *  @method DELETE
 *  @route  ~/api/maintenance-requests/:id
 *  @desc   Delete the  maintenance request
 *  @access private (TECH - ADMIN - SUBADMIN By Governorate)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {

        const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

      const requestId = parseInt(params.id);

          
          const subAdminUser = await prisma.user.findUnique({
            where:{
              id: user?.id
            },
            select:{
              subadmin:{
                select:{
                  governorate: true
                }
              }
            }
          })


   const maintenanceOrder = await prisma.maintenanceRequest.findUnique({
      where:{id: requestId},
      select:{
        id:true,
        governorate: true,
        customerId:true,
        technicianId:true,
        user:{
          select:{
            governorate:true
          }
        }
      }
    })

    if(!maintenanceOrder){
      return NextResponse.json(
        { message: "هذا الطلب غير متاح" },
        { status: 401 }
      );
    }

    if (user.id !== maintenanceOrder?.customerId && user.role !== Role.ADMIN && user.role !== Role.SUBADMIN && user.role !== Role.TECHNICAL ) {
        return NextResponse.json(
          { message: "ليس لديك الصلاحية بهذا الطلب" },
          { status: 401 }
        );
      }

    if ( user.role === Role.SUBADMIN  &&  maintenanceOrder?.user.governorate !== subAdminUser?.subadmin?.governorate ) {
        return NextResponse.json(
          { message: "ليس لديك الصلاحية بهذا الطلب" },
          { status: 401 }
        );
      }

    if ( user.role === Role.TECHNICAL &&  maintenanceOrder?.technicianId !== user.id) {
        return NextResponse.json(
          { message: "ليس لديك الصلاحية بهذا الطلب" },
          { status: 401 }
        );
      }



      const maintenanceRequest = await prisma.maintenanceRequest.delete({
        where: {id: requestId},
        include: {
            user: {
              select: {
                id: true,
                fullName: true,
                governorate: true,
              },
            },
            technician:{
                select:{
                    user:{
                        select:{
                            id:true,
                            fullName:true,
                            governorate:true,
                            email:true,
                        }
                    }
                }
            }
          },
      });

      const maintenance = {
        RequestID: maintenanceRequest.id,
        deviceType: maintenanceRequest.deviceType,
        problemDescription: maintenanceRequest.problemDescription,
        cost: maintenanceRequest.cost,
        isPaid: maintenanceRequest.isPaid,
        status: maintenanceRequest.status,
        costumerID: maintenanceRequest.user.id,
        costumerName: maintenanceRequest.user.fullName,
        costumerGovernorate: maintenanceRequest.user.governorate,
    }

  
      // Send email to the technician
      if (maintenanceRequest.technician && maintenanceRequest.technician.user) {
        await sendEmail({
          subject: "تم حذف طلبك ",
          content: `تم حذف الطلب من قائمة الطلبات  ${maintenance.deviceType}`,
          senderId: user.id,
          recipientId: maintenanceRequest.customerId
        });
  
        // Create notification for the technician
        await createNotification({
          recipientId: maintenanceRequest.technician?.user.id ,
          senderId: user.id,
          title: "حذف طلب صيانة" ,
          content: `تم حذف الطلب من قائمة الطلبات  ${maintenance.deviceType}`,
        });

        await sendRealMail({
          to: maintenanceRequest.technician.user.email,
          subject: " حذف طلب صيانة",
          html: ` <div dir="rtl">
      <h1>مرحبا بكم في منصتنا الخدمية EvoFix</h1>
      <h1>سيد/ة ${maintenanceRequest.user.fullName}</h1>
      <h3> تم حذف الطلب من قائمة الطلبات ${maintenance.deviceType} </h3>
    </div>`,
        });
      }
  
      return NextResponse.json({ message: "تم حذف الطلب بنجاح ", request: maintenance });
    } catch (error) {
      console.error("Error Delete order", error);
      return NextResponse.json({ message: " خطأ من الخادم أم أن الطلب محذوف بالفعل" }, { status: 500 | 401 });
    }
  }
  