import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 응답 객체 생성
  const response = NextResponse.next();
  
  // CORS 헤더 추가
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*'); // 배포 환경에서는 특정 도메인으로 제한하는 것이 좋습니다
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  return response;
}

// 특정 경로에만 미들웨어 적용
export const config = {
  matcher: [
    '/api/:path*', // 모든 API 경로에 적용
  ],
}; 