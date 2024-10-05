// src\utils\generateToken.ts
import Jwt from "jsonwebtoken";
import { JWTPayload } from "@/types/jwtPayload";
import { cookies } from 'next/headers'


// generate jwt token
export function generateJWT(jwtPayload: JWTPayload): string {
  const privateKey = process.env.JWT_SECRET as string;
  const token = Jwt.sign(jwtPayload, privateKey, { expiresIn: "30d" });
  return token;
}

//set cookie with jwt
// export function setTokenCookie(jwtPayload: JWTPayload):  string {
//   const token = generateJWT(jwtPayload);
//   // const cookie = serialize("jwtToken", token, {
//   const cookie = cookies().set("Token", token, {
//     httpOnly: false, 
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict", 
//     path: "/",
//     maxAge: 60 * 60 * 24 * 30, // 30 days
//   });
//   return cookie;
// }


export function setTokenCookie(jwtPayload: JWTPayload): string {
  const token = generateJWT(jwtPayload);
  cookies().set("Token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: 'http://localhost:3000',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return token; // Return the token string, if that's what you want
}
