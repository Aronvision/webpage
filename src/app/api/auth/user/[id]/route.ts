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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 매 요청마다 CORS 헤더 생성
  const corsHeaders = getCorsHeaders();
  
  try {
    // 환경 변수 체크를 위한 상세 디버깅 코드
    
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: "사용자 ID가 필요합니다." },
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', id)
      .single();

    if (error) {
      
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다.", code: error.code, details: error.details },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }

    return NextResponse.json(data, {
      headers: corsHeaders
    });
  } catch (error) {
    if (error instanceof Error) {
    }
    
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다.", error: error instanceof Error ? error.message : String(error) },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
} 