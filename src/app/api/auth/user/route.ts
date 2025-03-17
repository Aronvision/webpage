import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    let email = null;
    try {
      const url = new URL(request.url);
      email = url.searchParams.get('email');
    } catch (error) {
      console.error("URL 파싱 오류:", error);
      if (request.nextUrl) {
        email = request.nextUrl.searchParams.get('email');
      }
    }

    if (!email) {
      return NextResponse.json(
        { message: "이메일이 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('email', email)
      .single();

    if (error) {
      console.error("사용자 조회 오류:", error);
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("사용자 조회 중 오류 발생:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 