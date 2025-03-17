import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // 필수 필드 검증
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: "모든 필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase.rpc('create_user', {
      email,
      name,
      password
    });

    if (error) {
      console.error("회원가입 오류:", error);
      return NextResponse.json(
        { message: error.message || "회원가입 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ userId: data });
  } catch (error) {
    console.error("회원가입 처리 중 오류 발생:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 