// src\app\api\emails\recipient\route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/utils/verifyToken";
// import { getRecipientEmails } from "@/lib/email";


// /**
//  *  @method GET
//  *  @route  ~/api/emails/recipient
//  *  @desc   Get all emails recipient 
//  *  @access private (user or Tech his emails)
//  */

// export async function GET(request: NextRequest) {
//   try {
//     const account = verifyToken(request);
//     if (!account) {
//       return NextResponse.json(
//         { message: "لايوجد إيميلات لك" },
//         { status: 401 }
//       );
//     }

//    const emailsRecipient = await getRecipientEmails(account.id)
//    return NextResponse.json(emailsRecipient, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching Emails", error);
//     return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
//   }
// }
