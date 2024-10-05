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
    
      cookies().delete("Token");
      return NextResponse.json({ message: "تم تسجيل الخروج" }, { status: 200 });
    } catch (error) {
      console.error('Error fetching Data', error);
      return NextResponse.json({ message: "خطأ من الخادم" }, { status: 500 });
    }
  }
  