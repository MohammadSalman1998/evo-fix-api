// src\app\api\users\logout\route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";


/**
 *  @method GET
 *  @route  ~/api/users/logout
 *  @desc   logout user
 *  @access public
 */

export  function GET() {
    try {
    
      cookies().delete("jwtToken");
      return NextResponse.json({ message: "تم تسجيل الخروج" }, { status: 200 });
    } catch (error) {
      return NextResponse.json({error, message: "خطأ من الخادم" }, { status: 500 });
    }
  }
  