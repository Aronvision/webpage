import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    // 브라우저 환경에서는 현재 호스트 사용
    return window.location.origin;
  }
  
  // 서버 환경에서는 환경 변수 사용
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

/**
 * snake_case를 camelCase로 변환하는 함수
 * @param obj - 변환할 객체
 * @returns 변환된 객체
 */
export function snakeToCamel<T>(obj: Record<string, any>): T {
  if (!obj || typeof obj !== 'object') return obj as T;
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel<any>(item)) as unknown as T;
  }
  
  const newObj: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = obj[key];
    
    if (value && typeof value === 'object') {
      newObj[camelKey] = snakeToCamel(value);
    } else {
      newObj[camelKey] = value;
    }
  });
  
  return newObj as T;
}

/**
 * camelCase를 snake_case로 변환하는 함수
 * @param obj - 변환할 객체
 * @returns 변환된 객체
 */
export function camelToSnake<T>(obj: Record<string, any>): T {
  if (!obj || typeof obj !== 'object') return obj as T;
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake<any>(item)) as unknown as T;
  }
  
  const newObj: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    const value = obj[key];
    
    if (value && typeof value === 'object') {
      newObj[snakeKey] = camelToSnake(value);
    } else {
      newObj[snakeKey] = value;
    }
  });
  
  return newObj as T;
}
