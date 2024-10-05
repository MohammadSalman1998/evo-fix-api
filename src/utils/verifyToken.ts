// src\utils\verifyToken.ts
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { JWTPayload } from "@/types/jwtPayload";

//verify token fo api endpoint
export function verifyToken(request: NextRequest): JWTPayload | null {
  try {
    const jwtToken = request.cookies.get("Token");
    const token = jwtToken?.value;
    if (!token) return null;
    const privateKey = process.env.JWT_SECRET as string;
    const userPayload = jwt.verify(token, privateKey)  as JWTPayload;
    return userPayload;
  } catch (error) {
    return NextResponse.json({error}), null ;

  }
}



//verify token for pages
export function verifyTokenForPage(token: string): JWTPayload | null {

  try {
    if (!token) return null;
    const privateKey = process.env.JWT_SECRET as string;
    const userPayload = jwt.verify(token, privateKey)  as JWTPayload;
    return userPayload;
  } catch (error) {
    return NextResponse.json({error}), null
  }
}
