// src\app\api\maintenance-requests\[id]\accept\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { RequestStatus } from "@prisma/client";
import { createNotification } from "@/lib/notification";
import { verifyToken } from "@/utils/verifyToken";
import { sendEmail } from "@/lib/email";



/**
 *  @method PUT
 *  @route  ~/api/maintenance-requests/:id/accept
 *  @desc   Accept the cost quote for a maintenance request
 *  @access private (user)
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {

        const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    // if (user.role !== "USER") {
    //   return NextResponse.json({ message: "خاص بالمستخدم" }, { status: 401 });
    // }

      const requestId = parseInt(params.id);

          const maintenanceRequest = await prisma.maintenanceRequest.update({
            where: {
                 id: requestId,
                 status: "QUOTED",
                 customerId: user.id
                 },
            data: {
              status: RequestStatus.IN_PROGRESS,
            },
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
          subject: "تم قبول عرض السعر للصيانة",
          content: `تم قبول عرض السعر لطلب الصيانة  ${maintenance.deviceType}. يمكنك البدء في العمل.`,
          senderId: user.id,
          recipientId: maintenanceRequest.technician.user.id
        });
  
        // Create notification for the technician
        await createNotification({
          userId: maintenanceRequest.technician?.user.id ,
          content: `تم قبول عرض السعر لطلب الصيانة - ${maintenance.deviceType}`,
        });
      }
  
      return NextResponse.json({ message: "تم قبول عرض السعر بنجاح", request: maintenance });
    } catch (error) {
      console.error("Error accepting cost quote", error);
      return NextResponse.json({ message: " خطأ من الخادم أم أن الطلب قد تمت الموافقة عليه بالفعل" }, { status: 500 | 401 });
    }
  }
  