// src\utils\generateToken.ts
import Jwt from "jsonwebtoken";
import { JWTPayload } from "@/types/jwtPayload";
import { serialize } from "cookie";


// generate jwt token
export function generateJWT(jwtPayload: JWTPayload): string {
  const privateKey = process.env.JWT_SECRET;
  const token = Jwt.sign(jwtPayload, privateKey, { expiresIn: "30d" });
  return token;
}

//set cookie with jwt
export function setTokenCookie(jwtPayload: JWTPayload): string {
  const token = generateJWT(jwtPayload);
  const cookie = serialize("jwtToken", token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", 
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return cookie;
}

