'use client';

import { createClient } from "@/lib/supabase/client";

// API 기본 URL 설정
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 브라우저에서는 NEXT_PUBLIC 변수를 확인하거나 상대 경로 사용
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
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
    // 클라이언트 API 엔드포인트 호출
    const response = await fetch(`${getBaseUrl()}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '회원가입 중 오류가 발생했습니다.');
    }

    const data = await response.json();
    return { success: true, userId: data.userId };
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
    const response = await fetch(`${getBaseUrl()}/api/auth/user?email=${encodeURIComponent(email)}`);
    
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
    const response = await fetch(`${getBaseUrl()}/api/auth/user/${id}`);
    
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("사용자 조회 중 오류 발생:", error);
    return null;
  }
} 