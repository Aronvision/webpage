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
    console.log("환경 변수 디버깅 정보:");
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY 길이:", process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0);
    
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

    console.log("ID로 사용자 조회 시작:", { id });
    console.log("Supabase 클라이언트 생성 시작");
    const supabase = await createClient();
    console.log("Supabase 클라이언트 생성 성공");
    
    console.log("Supabase ID로 사용자 조회 쿼리 실행");
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', id)
      .single();

    if (error) {
      console.error("사용자 조회 오류 상세:", error);
      console.error("오류 코드:", error.code);
      console.error("오류 메시지:", error.message);
      console.error("오류 상세:", error.details);
      
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다.", code: error.code, details: error.details },
        { 
          status: 404,
          headers: corsHeaders
        }
      );
    }

    console.log("사용자 조회 성공:", { userId: data.id, email: data.email });
    return NextResponse.json(data, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error("사용자 조회 중 일반 오류 발생:", error);
    if (error instanceof Error) {
      console.error("오류 이름:", error.name);
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
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