// src\app\api\emails\admin\route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/utils/verifyToken";
// import { getAllEmails } from "@/lib/email";


// /**
//  *  @method GET
//  *  @route  ~/api/emails/admin
//  *  @desc   Get all emails sent 
//  *  @access private (only Admin show all emails)
//  */

// export async function GET(request: NextRequest) {
//   try {
//     const account = verifyToken(request);
//     if (!account || account.role !== "ADMIN") {
//       return NextResponse.json(
//         { message: "ليس لديك الصلاحية" },
//         { status: 401 }
//       );
//     }

//    const emails = await getAllEmails()
//    return NextResponse.json(emails, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching Emails", error);
//     return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
//   }
// }
