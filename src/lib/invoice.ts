// src\lib\invoice.ts
import prisma from "@/utils/db";
import { newInvoice, updateinvoice } from "@/utils/dtos";

export async function createInvoice({
  userId,
  requestId,
  amount,
  issueDate,
  dueDate,
  isPaid,
  paidAt,
}: newInvoice) {
  try {
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        requestId,
        amount,
        issueDate,
        dueDate,
        isPaid,
        paidAt,
      },
    });
    return invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice");
  }
}

export async function updateInvoice({
  requestId,
  dueDate,
  isPaid,
  paidAt,
}: updateinvoice) {
  try {
    const invoice = await prisma.invoice.update({
      data: {
        dueDate,
        isPaid,
        paidAt,
      },
      where: { requestId: requestId },
    });
    return invoice;
  } catch (error) {
    console.error("Error update invoice:", error);
    throw new Error("Failed to update invoice");
  }
}

export async function getMyInvoices( userId : number) {
  try {
    const myInvoices = await prisma.invoice.findMany({
      where: { userId: userId },
      select: {
        amount: true,
        issueDate: true,
        dueDate: true,
        isPaid: true,
        paidAt: true,
        user: {
          select: {
            fullName: true,
          },
        },
        request: {
          select: {
            deviceType: true,
            deviceModel: true,
            problemDescription: true,
            isPaidCheckFee: true,
            governorate:true,
            Epaid:{
                select:{
                    CheckFee:true,
                }
              }
          },
        },
      },
    });

    return myInvoices;
  } catch (error) {
    console.error("Error get my invoices:", error);
    throw new Error("Failed to get my invoices");
  }
}


export async function getByGovernorateInvoices( governorate : string) {
    try {
      const InvoicesByGovernorate = await prisma.invoice.findMany({
        where: { request:{governorate:governorate} },
        select: {
          amount: true,
          issueDate: true,
          dueDate: true,
          isPaid: true,
          paidAt: true,
          user: {
            select: {
              fullName: true,
            },
          },
          request: {
            select: {
              deviceType: true,
              deviceModel: true,
              problemDescription: true,
              isPaidCheckFee: true,
              governorate:true,
              Epaid:{
                select:{
                    CheckFee:true,
                }
              }
            },
          },
        },
      });
  
      return InvoicesByGovernorate;
    } catch (error) {
      console.error("Error get Invoices By Governorate:", error);
      throw new Error("Failed to get Invoices By Governorate");
    }
  }

  export async function getAllInvoices() {
    try {
      const allInvoices = await prisma.invoice.findMany({
        select: {
          amount: true,
          issueDate: true,
          dueDate: true,
          isPaid: true,
          paidAt: true,
          user: {
            select: {
              fullName: true,
            },
          },
          request: {
            select: {
              deviceType: true,
              deviceModel: true,
              problemDescription: true,
              isPaidCheckFee: true,
              governorate:true,
              Epaid:{
                select:{
                    CheckFee:true,
                }
              }
            },
          },
        },
      });
  
      return allInvoices;
    } catch (error) {
      console.error("Error get all invoices:", error);
      throw new Error("Failed to get all invoices");
    }
  }
  