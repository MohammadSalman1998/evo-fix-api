// src\app\api\maintenance-requests\count\route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { verifyToken } from "@/utils/verifyToken";
import {
  countAllRequests,
  countAllRequestsForSubAdmin,
  countAllRequestsForTech,
  countAllRequestsForUser,
  countAssignRequests,
  countAssignRequestsForSubAdmin,
  countAssignRequestsForTech,
  countAssignRequestsForUser,
  countCompleteRequests,
  countCompleteRequestsForSubAdmin,
  countCompleteRequestsForTech,
  countCompleteRequestsForUser,
  countInProgressRequests,
  countInProgressRequestsForSubAdmin,
  countInProgressRequestsForTech,
  countInProgressRequestsForUser,
  countPendingRequests,
  countPendingRequestsForSubAdmin,
  countPendingRequestsForTech,
  countPendingRequestsForUser,
  countQuotedRequests,
  countQuotedRequestsForSubAdmin,
  countQuotedRequestsForTech,
  countQuotedRequestsForUser,
  countRejectRequests,
  countRejectRequestsForSubAdmin,
  countRejectRequestsForTech,
  countRejectRequestsForUser,
} from "@/lib/requests";
import { countNotPublishedFAQ } from "@/lib/faq";

/**
 *  @method GET
 *  @route  ~/api/maintenance-requests/count
 *  @desc   get count of all requests
 *  @access private (only user him request or subAdmin by governorate or tech by him tasks or admin)
 */

export async function GET(request: NextRequest) {
  try {
    const account = verifyToken(request);
    if (!account) {
      return NextResponse.json(
        { message: "قم بتسجيل الدخول" },
        { status: 403 }
      );
    }

    const infoAccount = await prisma.user.findUnique({
      where: { id: account?.id },
      include: {
        customer: true,
        technician: true,
        subadmin: true,
      },
    });
    const governorate = infoAccount?.subadmin?.governorate as string;
    const specialization = infoAccount?.technician?.specialization as string;
    let AllRequests;
    let Pending;
    let Assign;
    let Complete;
    let InProgress;
    let Reject;
    let Quoted;
    let FAQ;
    if (account.role === "ADMIN") {
      AllRequests = await countAllRequests();
      Pending = await countPendingRequests();
      Assign = await countAssignRequests();
      Complete = await countCompleteRequests();
      InProgress = await countInProgressRequests();
      Reject = await countRejectRequests();
      Quoted = await countQuotedRequests();
      FAQ = await countNotPublishedFAQ();
    }
    if (account.role === "SUBADMIN") {
      AllRequests = await countAllRequestsForSubAdmin(governorate) ;
      Pending = await countPendingRequestsForSubAdmin(governorate) ;
      Assign = await countAssignRequestsForSubAdmin(governorate) ;
      Complete = await countCompleteRequestsForSubAdmin(governorate) ;
      InProgress = await countInProgressRequestsForSubAdmin(governorate) ;
      Reject = await countRejectRequestsForSubAdmin(governorate) ;
      Quoted = await countQuotedRequestsForSubAdmin(governorate) ;
      FAQ = await countNotPublishedFAQ();
    }
    if (account.role === "TECHNICAL") {
      AllRequests = await countAllRequestsForTech(account.id) ;
      Pending = await countPendingRequestsForTech(specialization) ;
      Assign = await countAssignRequestsForTech(account.id) ;
      Complete = await countCompleteRequestsForTech(account.id) ;
      InProgress = await countInProgressRequestsForTech(account.id) ;
      Reject = await countRejectRequestsForTech(account.id) ;
      Quoted = await countQuotedRequestsForTech(account.id) ;
    }
    if (account.role === "USER") {
      AllRequests = await countAllRequestsForUser(account.id) ;
      Pending = await countPendingRequestsForUser(account.id) ;
      Assign = await countAssignRequestsForUser(account.id) ;
      Complete = await countCompleteRequestsForUser(account.id) ;
      InProgress = await countInProgressRequestsForUser(account.id) ;
      Reject = await countRejectRequestsForUser(account.id) ;
      Quoted = await countQuotedRequestsForUser(account.id) ;
    }



    return NextResponse.json({AllRequests,Pending,Assign,Complete,InProgress,Reject,Quoted,FAQ}, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
  }
}
