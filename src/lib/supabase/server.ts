import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  try {
    const cookieStore = await cookies();
    
    // 환경 변수 체크
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수 오류:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        nodeEnv: process.env.NODE_ENV
      });
      
      // 환경 변수 디버깅 정보
      
      // 프로덕션 환경에서는 하드코딩된 값을 사용하지 않도록 주의
      if (process.env.NODE_ENV === 'production') {
        throw new Error("프로덕션 환경에서 Supabase 연결 정보가 누락되었습니다. Vercel 대시보드에서 환경 변수를 확인하세요.");
      } else {
        // 개발 환경일 경우 .env.local 파일의 값을 사용
      }
    }
    
    // Supabase 클라이언트 생성
    try {
      
      return createSupabaseClient(
        supabaseUrl!,
        supabaseKey!,
        {
          auth: {
            persistSession: false,
          }
        }
      );
    } catch (clientError) {
      console.error("Supabase 클라이언트 생성 오류:", clientError);
      
      if (clientError instanceof Error) {
        console.error("클라이언트 오류 이름:", clientError.name);
        console.error("클라이언트 오류 메시지:", clientError.message);
      }
      
      throw new Error("Supabase 클라이언트를 생성할 수 없습니다.");
    }
  } catch (error) {
    console.error("Supabase 서버 클라이언트 생성 오류:", error);
    
    if (error instanceof Error) {
      console.error("오류 이름:", error.name);
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
    }
    
    throw error;
  }
}

export async function createPureClient() {
  try {
    // 환경 변수 체크
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase 환경 변수 오류:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        nodeEnv: process.env.NODE_ENV
      });
      
      // 환경 변수 디버깅 정보
      
      // 프로덕션 환경에서는 하드코딩된 값을 사용하지 않도록 주의
      if (process.env.NODE_ENV === 'production') {
        throw new Error("프로덕션 환경에서 Supabase 연결 정보가 누락되었습니다. Vercel 대시보드에서 환경 변수를 확인하세요.");
      }
    }
    
    
    return createSupabaseClient(
      supabaseUrl!,
      supabaseKey!,
      {
        auth: {
          persistSession: false,
        }
      }
    );
  } catch (error) {
    console.error("Supabase Pure 클라이언트 생성 오류:", error);
    
    if (error instanceof Error) {
      console.error("오류 이름:", error.name);
      console.error("오류 메시지:", error.message);
      console.error("오류 스택:", error.stack);
    }
    
    throw error;
  }
}
