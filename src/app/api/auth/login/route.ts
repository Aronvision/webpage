import { createPureClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 정적 생성 중에는 실행되지 않도록 설정
export const dynamic = 'force-dynamic';

// CORS 헤더 설정을 위한 헬퍼 함수
const getCorsHeaders = () => {
  // API URL에서 origin 추출
  const allowedOrigin = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
};

// CORS 프리플라이트 요청 처리
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  // 매 요청마다 CORS 헤더 생성
  const corsHeaders = getCorsHeaders();
  
  try {
    // 환경 변수 체크를 위한 상세 디버깅 코드
    
    const { email, password } = await request.json();


    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 개발 환경에서만 사용할 테스트 계정
    if (process.env.NODE_ENV === 'development') {
      // 테스트용 더미 계정 (개발 환경에서만 작동)
      if (email === 'test@example.com' && password === 'password') {
        return NextResponse.json({
          id: 'test-user-id-123',
          email: 'test@example.com',
          name: '테스트 사용자'
        }, {
          headers: corsHeaders,
        });
      }
    }

    // 아래는 기존 Supabase 인증 코드
    try {
      const supabase = await createPureClient();
      
      // Supabase 함수를 사용하여 사용자 인증
      const { data, error } = await supabase
        .rpc('authenticate_user', {
          input_email: email,
          input_password: password
        });

      if (error) {
        
        return NextResponse.json(
          { error: "이메일 또는 비밀번호가 올바르지 않습니다.", code: error.code, details: error.details },
          { 
            status: 401,
            headers: corsHeaders,
          }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
          { 
            status: 401,
            headers: corsHeaders,
          }
        );
      }

      const user = data[0];
      
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name
      }, {
        headers: corsHeaders,
      });
    } catch (e) {
      if (e instanceof Error) {
      }
      
      // 개발 환경에서는 오류가 있을 경우 기본 사용자로 로그인 처리
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          id: 'fallback-dev-user-id',
          email: email,
          name: '개발 사용자'
        }, {
          headers: corsHeaders,
        });
      }
      
      // 실제 환경에서는 오류 반환
      return NextResponse.json(
        { error: "인증 서비스 오류가 발생했습니다.", details: e instanceof Error ? e.message : String(e) },
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
    }
    
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다.", details: error instanceof Error ? error.message : String(error) },
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
} 