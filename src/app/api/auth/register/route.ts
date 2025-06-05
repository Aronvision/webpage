import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 정적 생성 중에는 실행되지 않도록 설정
export const dynamic = 'force-dynamic';

// CORS 헤더 설정을 위한 헬퍼 함수
const getCorsHeaders = () => {
  // API URL에서 origin 추출
  const allowedOrigin = process.env.NEXTAUTH_URL || 'https://mobile-ten-rho.vercel.app';
  
  
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

    const { email, name, password } = await request.json();

    // 필수 필드 검증
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: "모든 필수 항목을 입력해주세요." },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 추가 로깅

    try {
      const supabase = await createClient();
      
      try {
        const { data, error } = await supabase.rpc('create_user', {
          email,
          name,
          password
        });
        
        if (error) {
          
          return NextResponse.json(
            { message: error.message || "회원가입 중 오류가 발생했습니다.", code: error.code, details: error.details },
            { 
              status: 500,
              headers: corsHeaders,
            }
          );
        }

        return NextResponse.json({ userId: data }, { 
          headers: corsHeaders,
        });
      } catch (rpcError) {
        if (rpcError instanceof Error) {
        }
        
        return NextResponse.json(
          { message: "RPC 함수 실행 중 오류가 발생했습니다.", error: rpcError instanceof Error ? rpcError.message : String(rpcError) },
          { 
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    } catch (clientError) {
      if (clientError instanceof Error) {
      }
      
      return NextResponse.json(
        { message: "Supabase 연결 중 오류가 발생했습니다.", error: clientError instanceof Error ? clientError.message : String(clientError) },
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
      { message: "서버 오류가 발생했습니다.", error: error instanceof Error ? error.message : String(error) },
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
} 