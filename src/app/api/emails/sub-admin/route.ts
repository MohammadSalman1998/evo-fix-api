// src\app\api\emails\sub-admin\route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/utils/verifyToken";
// import { getAllEmailsByGovernorate } from "@/lib/email";
// import prisma from "@/utils/db";


// /**
//  *  @method GET
//  *  @route  ~/api/emails/sub-admin
//  *  @desc   Get all emails sent 
//  *  @access private (only Admin show all emails)
//  */

// export async function GET(request: NextRequest) {
//   try {
//     const account = verifyToken(request);
//     if (!account || account.role !== "SUBADMIN") {
//       return NextResponse.json(
//         { message: "ليس لديك الصلاحية" },
//         { status: 401 }
//       );
//     }

//     const subAdminUser = await prisma.user.findUnique({
//         where:{
//           id: account?.id
//         },
//         select:{
//           subadmin:{
//             select:{
//               governorate: true
//             }
//           }
//         }
//       })
//      const governorate = subAdminUser?.subadmin?.governorate as string

//    const emailsByGovernorate = await getAllEmailsByGovernorate(governorate)
//    return NextResponse.json(emailsByGovernorate, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching Emails", error);
//     return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
//   }
// }