// src\lib\epaid.ts
import prisma from "@/utils/db";
import { NewEpaid } from "@/utils/dtos";

export async function CheckFeePaid({
 
  senderId,
  requestId,
  OperationNumber,
  amount,
  CheckFee,
  textMessage,
  typePaid,
}: NewEpaid) {
  try {
    const ePaid = prisma.epaid.create({
      data: {
        senderId,
        requestId,
        OperationNumber,
        amount,
        CheckFee,
        textMessage,
        typePaid,
      },
    });
    return ePaid;
  } catch (error) {
    console.error("Error creating ePaid:", error);
    throw new Error("Failed to create ePaid");
  }
}


 //   senderId: number,
  //   requestId: number,
  //   OperationNumber: number,
  //   amount: number | null,
  //   CheckFee: number | null,
  //   textMessage: string,
  //   typePaid: typeEpaid,