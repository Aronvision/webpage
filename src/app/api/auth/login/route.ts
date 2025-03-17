import { createPureClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
  } catch (error) {
    console.error("로그인 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 