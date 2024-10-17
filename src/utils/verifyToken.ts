// src\utils\verifyToken.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types/jwtPayload';

const secret = process.env.JWT_SECRET as string;

export  function verifyToken(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     return null
  }

  const token = authHeader.split(' ')[1]; 

  try {
    const userPayload = jwt.verify(token, secret) as JWTPayload;
    return userPayload; 
  } catch (error) {
    return NextResponse.json({error}), null ;
  }
}
