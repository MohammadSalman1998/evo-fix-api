// src\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsMiddleware } from '@/utils/cors';

const cors = corsMiddleware();

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  await cors(request, response);
  return response;
}

export const config = {
  matcher: '/api/:path*',
};