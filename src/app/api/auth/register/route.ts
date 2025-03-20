import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 정적 생성 중에는 실행되지 않도록 설정
export const dynamic = 'force-dynamic';

// CORS 헤더 설정을 위한 헬퍼 함수
const getCorsHeaders = () => {
  // API URL에서 origin 추출
  const allowedOrigin = process.env.NEXTAUTH_URL || 'https://mobile-ten-rho.vercel.app';
  
  console.log("CORS 설정에 사용될 origin:", allowedOrigin);
  
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
    console.log("환경 변수 디버깅 정보:");
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE_SERVICE_ROLE_KEY 길이:", process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0);
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    console.log("NODE_ENV:", process.env.NODE_ENV);

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
    console.log("회원가입 요청 처리 시작:", { email, name });

    try {
      console.log("Supabase 클라이언트 생성 시작");
      const supabase = await createClient();
      console.log("Supabase 클라이언트 생성 성공");
      
      try {
        console.log("Supabase RPC 함수 호출 시작: create_user");
        const { data, error } = await supabase.rpc('create_user', {
          email,
          name,
          password
        });
        
        if (error) {
          console.error("회원가입 RPC 오류 상세:", error);
          console.error("오류 코드:", error.code);
          console.error("오류 메시지:", error.message);
          console.error("오류 상세:", error.details);
          
          return NextResponse.json(
            { message: error.message || "회원가입 중 오류가 발생했습니다.", code: error.code, details: error.details },
            { 
              status: 500,
              headers: corsHeaders,
            }
          );
        }

        console.log("회원가입 성공:", { userId: data });
        return NextResponse.json({ userId: data }, { 
          headers: corsHeaders,
        });
      } catch (rpcError) {
        console.error("Supabase RPC 실행 중 예외 발생 상세:", rpcError);
        if (rpcError instanceof Error) {
          console.error("RPC 오류 이름:", rpcError.name);
          console.error("RPC 오류 메시지:", rpcError.message);
          console.error("RPC 오류 스택:", rpcError.stack);
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
      console.error("Supabase 클라이언트 생성 중 오류 발생 상세:", clientError);
      if (clientError instanceof Error) {
        console.error("클라이언트 오류 이름:", clientError.name);
        console.error("클라이언트 오류 메시지:", clientError.message);
        console.error("클라이언트 오류 스택:", clientError.stack);
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
    console.error("회원가입 처리 중 일반 오류 발생:", error);
    if (error instanceof Error) {
      console.error("오류 이름:", error.name);
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
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