import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 정적 생성 중에는 실행되지 않도록 설정
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: "사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', id)
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