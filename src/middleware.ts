
// src\middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsMiddleware } from '@/utils/cors';

const cors = corsMiddleware();

// استخدام Map للتخزين المؤقت
const rateLimitStore = new Map<string, { requests: number[], windowStart: number }>();

const WINDOW_DURATION_IN_MINUTES = 1;
const MAX_REQUESTS = 30;

interface RateLimitResult {
  isWithinLimit: boolean;
  remaining: number;
  total: number;
}

function getRealIP(request: NextRequest): string {
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }

  return request.ip || 'unknown';
}

function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowMs = WINDOW_DURATION_IN_MINUTES * 60 * 1000;

  // إزالة السجلات القديمة
  rateLimitStore.forEach((data, storedIP) => {
    if (now - data.windowStart > windowMs) {
      rateLimitStore.delete(storedIP);
    }
  });

  // التحقق من السجل الحالي أو إنشاء سجل جديد
  let record = rateLimitStore.get(ip);
  if (!record) {
    record = {
      requests: [],
      windowStart: now,
    };
    rateLimitStore.set(ip, record);
  }

  // إزالة الطلبات القديمة من النافذة الحالية
  record.requests = record.requests.filter(
    timestamp => now - timestamp < windowMs
  );

  // إضافة الطلب الحالي
  record.requests.push(now);

  // حساب العدد المتبقي
  const remaining = MAX_REQUESTS - record.requests.length;

  return {
    isWithinLimit: record.requests.length <= MAX_REQUESTS,
    remaining: Math.max(0, remaining),
    total: MAX_REQUESTS
  };
}

export async function middleware(request: NextRequest) {
  const ip = getRealIP(request);
  const rateLimitResult = checkRateLimit(ip);
  
  if (!rateLimitResult.isWithinLimit) {
    return NextResponse.json(
      { 
        message: "لقد تجاوزت الحد الأقصى للطلبات، قم بالمحاولة لاحقا.",
        retryAfter: WINDOW_DURATION_IN_MINUTES * 60,
        remaining: rateLimitResult.remaining,
        limit: rateLimitResult.total
      }, 
      { 
        status: 429,
        headers: {
          'Retry-After': (WINDOW_DURATION_IN_MINUTES * 60).toString(),
          'X-RateLimit-Limit': rateLimitResult.total.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': (Date.now() + (WINDOW_DURATION_IN_MINUTES * 60 * 1000)).toString()
        }
      }
    );
  }

  const response = NextResponse.next();
  
  // إضافة headers معدل الطلبات
  response.headers.set('X-RateLimit-Limit', rateLimitResult.total.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  
  await cors(request, response);
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
















// src\middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { corsMiddleware } from '@/utils/cors';

// const cors = corsMiddleware();

// export async function middleware(request: NextRequest) {
//   const response = NextResponse.next();
//   await cors(request, response);
//   return response;
// }

// export const config = {
//   matcher: '/api/:path*',
// };




// // src/middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { corsMiddleware } from '@/utils/cors';
// import Redis from 'ioredis';

// const redis = new Redis(process.env.REDIS_URL || 'http://localhost:3001');

// const WINDOW_DURATION_IN_MINUTES = 1;
// const MAX_REQUESTS = 10;

// const cors = corsMiddleware();

// interface RateLimitResult {
//   isWithinLimit: boolean;
//   remaining: number;
//   total: number;
// }

// // دالة للحصول على IP الحقيقي للمستخدم
// function getRealIP(request: NextRequest): string {
//   // التحقق من وجود Cloudflare
//   const cfIP = request.headers.get('cf-connecting-ip');
//   if (cfIP) return cfIP;

//   // التحقق من X-Real-IP (يستخدم عادة مع Nginx)
//   const realIP = request.headers.get('x-real-ip');
//   if (realIP) return realIP;

//   // التحقق من X-Forwarded-For
//   const forwardedFor = request.headers.get('x-forwarded-for');
//   if (forwardedFor) {
//     // X-Forwarded-For يمكن أن يحتوي على قائمة من IPs
//     // نأخذ أول IP لأنه عادة يكون IP المستخدم الأصلي
//     const ips = forwardedFor.split(',');
//     return ips[0].trim();
//   }

//   // الحصول على IP المباشر من الطلب
//   return request.ip || 'unknown';
// }

// async function checkRateLimit(ip: string): Promise<RateLimitResult> {
//   if (ip === 'unknown') {
//     console.warn('Unable to determine client IP address');
//     return {
//       isWithinLimit: true,
//       remaining: MAX_REQUESTS,
//       total: MAX_REQUESTS
//     }; // نسمح بالطلب في حالة عدم التمكن من تحديد IP
//   }

//   const key = `rate-limit:${ip}`;
//   const currentTime = Date.now();
//   const windowStart = currentTime - (WINDOW_DURATION_IN_MINUTES * 60 * 1000);

//   try {
//     const pipeline = redis.pipeline();
//     pipeline.zadd(key, currentTime, currentTime.toString());
//     pipeline.zremrangebyscore(key, 0, windowStart);
//     pipeline.zcard(key);
//     pipeline.expire(key, WINDOW_DURATION_IN_MINUTES * 60);

//     const results = await pipeline.exec();
//     if (!results) 
//        return {
//       isWithinLimit: true,
//       remaining: MAX_REQUESTS,
//       total: MAX_REQUESTS
//     };

//     const requestCount = results[2]?.[1] as number;
//     const remaining = MAX_REQUESTS - requestCount;

//     // تخزين العدد المتبقي للاستخدام في الرد
//     return {
//       isWithinLimit: requestCount <= MAX_REQUESTS,
//       remaining: remaining > 0 ? remaining : 0,
//       total: MAX_REQUESTS
//     };
//   } catch (error) {
//     console.error('Rate limit check failed:', error);
//     return {
//       isWithinLimit: true,
//       remaining: MAX_REQUESTS,
//       total: MAX_REQUESTS
//     };
//   }
// }

// export async function middleware(request: NextRequest) {
//   // الحصول على IP الحقيقي
//   const ip = getRealIP(request);
  
//   // التحقق من معدل الطلبات
//   const rateLimitResult = await checkRateLimit(ip);
  
//   if (!rateLimitResult.isWithinLimit) {
//     return NextResponse.json(
//       { 
//         message: "لقد تجاوزت الحد الأقصى للطلبات، قم بالمحاولة لاحقا.",
//         retryAfter: WINDOW_DURATION_IN_MINUTES * 60,
//         remaining: rateLimitResult.remaining,
//         limit: rateLimitResult.total
//       }, 
//       { 
//         status: 429,
//         headers: {
//           'Retry-After': (WINDOW_DURATION_IN_MINUTES * 60).toString(),
//           'X-RateLimit-Limit': rateLimitResult.total.toString(),
//           'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
//           'X-RateLimit-Reset': (Date.now() + (WINDOW_DURATION_IN_MINUTES * 60 * 1000)).toString()
//         }
//       }
//     );
//   }

//   // إضافة headers معدل الطلبات للاستجابة
//   const response = NextResponse.next();
//   response.headers.set('X-RateLimit-Limit', rateLimitResult.total.toString());
//   response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  
//   await cors(request, response);
//   return response;
// }

// export const config = {
//   matcher: '/api/:path*',
// };


