import { createPureClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 정적 생성 중에는 실행되지 않도록 설정
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("로그인 시도:", { email });

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 개발 환경에서만 사용할 테스트 계정
    if (process.env.NODE_ENV === 'development') {
      // 테스트용 더미 계정 (개발 환경에서만 작동)
      if (email === 'test@example.com' && password === 'password') {
        console.log("개발 환경 테스트 계정으로 로그인 성공");
        return NextResponse.json({
          id: 'test-user-id-123',
          email: 'test@example.com',
          name: '테스트 사용자'
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
        console.error("Supabase 인증 오류:", error);
        return NextResponse.json(
          { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
          { status: 401 }
        );
      }

      if (!data || data.length === 0) {
        console.error("인증 실패: 사용자를 찾을 수 없음");
        return NextResponse.json(
          { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
          { status: 401 }
        );
      }

      const user = data[0];
      console.log("로그인 성공:", { userId: user.id, email: user.email });
      
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (e) {
      console.error("Supabase 인증 과정에서 오류 발생:", e);
      
      // 개발 환경에서는 오류가 있을 경우 기본 사용자로 로그인 처리
      if (process.env.NODE_ENV === 'development') {
        console.warn("개발 환경: Supabase 오류가 발생하여 기본 사용자로 로그인");
        return NextResponse.json({
          id: 'fallback-dev-user-id',
          email: email,
          name: '개발 사용자'
        });
      }
      
      // 실제 환경에서는 오류 반환
      return NextResponse.json(
        { error: "인증 서비스 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("로그인 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 