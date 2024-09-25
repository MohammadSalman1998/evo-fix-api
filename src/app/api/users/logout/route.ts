// src\app\api\users\logout\route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";


/**
 *  @method GET
 *  @route  ~/api/users/logout
 *  @desc   logout user
 *  @access public
 */

export  function GET(request: NextRequest) {
    try {
    
      cookies().delete("jwtToken");
      return NextResponse.json({ message: "تم تسجيل الخروج" }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
    }
  }
  