// src\utils\cors.ts
import { NextRequest, NextResponse } from 'next/server';

type CorsOptions = {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
};



const defaultOptions: CorsOptions = {
  allowedOrigins: ['http://localhost:3000','https://evo-fix-api.vercel.app','https://musical-guide-wrvrj794xq793gj6j-3000.app.github.dev','https://evo-fi.vercel.app/'], // Add your frontend URL(s)
  allowedMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization','authorization'],
  exposedHeaders: [],
  maxAge: 86400, // 24 hours
  credentials: true,
};

export function corsMiddleware(options: Partial<CorsOptions> = {}) {
  const corsOptions: CorsOptions = { ...defaultOptions, ...options };

  return async function cors(request: NextRequest, response: NextResponse) {
    const origin = request.headers.get('origin') || '';
    const isAllowedOrigin = corsOptions.allowedOrigins.includes('*') || corsOptions.allowedOrigins.includes(origin);

    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    if (corsOptions.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (request.method === 'OPTIONS') {
      response.headers.set('Access-Control-Allow-Methods', corsOptions.allowedMethods.join(', '));
      response.headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));

      if (corsOptions.exposedHeaders && corsOptions.exposedHeaders.length > 0) {
        response.headers.set('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
      }

      if (corsOptions.maxAge) {
        response.headers.set('Access-Control-Max-Age', corsOptions.maxAge.toString());
      }

      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    return response;
  };
}
