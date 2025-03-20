'use client';

import { createClient } from "@/lib/supabase/client";

// API 기본 URL 설정
const getBaseUrl = () => {
  // 현재 창의 위치에서 API URL 생성 (CORS 문제 해결)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return origin;
  }
  // 서버 측에서는 환경 변수 사용
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export interface RegisterUserParams {
  email: string;
  name: string;
  password: string;
}

/**
 * 새 사용자를 등록합니다.
 */
export async function registerUser({ email, name, password }: RegisterUserParams) {
  try {
    console.log("회원가입 API 호출 시작:", { email, name });
    const apiUrl = `${getBaseUrl()}/api/auth/register`;
    console.log("사용 중인 API URL:", apiUrl);
    
    // 클라이언트 API 엔드포인트 호출
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password }),
      mode: 'cors',
      credentials: 'include',
    });

    const responseText = await response.text();
    console.log("서버 응답 상태:", response.status, response.statusText);
    
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("서버 응답 파싱 오류:", parseError);
      console.log("원본 응답 텍스트:", responseText);
      throw new Error('서버 응답을 파싱할 수 없습니다.');
    }

    if (!response.ok) {
      console.error("회원가입 API 오류:", responseData);
      throw new Error(responseData.message || '회원가입 중 오류가 발생했습니다.');
    }

    console.log("회원가입 성공:", responseData);
    return { success: true, userId: responseData.userId };
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 사용자 정보를 이메일로 조회합니다.
 */
export async function getUserByEmail(email: string) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/auth/user?email=${encodeURIComponent(email)}`, {
      mode: 'cors',
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("사용자 조회 중 오류 발생:", error);
    return null;
  }
}

/**
 * 사용자 정보를 ID로 조회합니다.
 */
export async function getUserById(id: string) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/auth/user/${id}`, {
      mode: 'cors',
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("사용자 조회 중 오류 발생:", error);
    return null;
  }
} 