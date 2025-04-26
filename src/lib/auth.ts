import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "이메일/비밀번호",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("인증 실패: 이메일 또는 비밀번호 누락");
          throw new Error("이메일과 비밀번호를 모두 입력해주세요.");
        }

        try {
          console.log(`인증 시도: ${credentials.email}`);
          
          // 상대 경로 대신 절대 경로 사용
          // 환경 변수 기반 URL 설정 - 포트 번호를 3001로 수정
          const baseUrl = process.env.NEXTAUTH_URL || 
                         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3001");
          
          const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error("로그인 API 오류:", response.status, response.statusText);
            // 서버에서 전달한 에러 메시지를 사용
            throw new Error(data.error || "이메일 또는 비밀번호가 올바르지 않습니다.");
          }

          const user = data;
          
          console.log("인증 성공:", user);
          
          if (!user || !user.id) {
            console.error("인증 실패: 유효하지 않은 사용자 데이터");
            throw new Error("유효하지 않은 사용자 정보입니다.");
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name || "사용자"
          };
        } catch (error) {
          console.error("인증 중 오류 발생:", error);
          // Error 객체에서 메시지 추출
          throw new Error(error instanceof Error ? error.message : "인증 중 오류가 발생했습니다.");
        }
      }
    }),
    // 필요한 경우 다른 제공자 추가
  ],
  pages: {
    signIn: "/login",
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_do_not_use_in_production",
  debug: process.env.NODE_ENV === "development",
};

// 타입 확장
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
