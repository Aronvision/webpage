import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";

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
          return null;
        }

        try {
          // 직접 사용자 인증 로직 구현 (API 호출 대신)
          // 예시: 데이터베이스에서 사용자 조회 및 비밀번호 검증
          // 실제 구현에서는 데이터베이스 연결 코드로 대체해야 함
          
          // 임시 사용자 데이터 (테스트용)
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            return {
              id: "1",
              email: credentials.email,
              name: "테스트 사용자"
            };
          }
          
          return null;
        } catch (error) {
          console.error("인증 중 오류 발생:", error);
          return null;
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
  secret: process.env.NEXTAUTH_SECRET,
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
