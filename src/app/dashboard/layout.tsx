'use client';

import { Header } from '@/components/layout/header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();
  const router = useRouter();
  
  // 디버깅을 위한 세션 상태 로깅
  useEffect(() => {
  }, [status, session]);

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 로딩 중인 경우
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header isLoggedIn={false} />
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="text-neutral-500">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col">
        <Header isLoggedIn={false} />
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="text-neutral-500">인증이 필요한 페이지입니다. 로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  // 인증된 경우 대시보드 레이아웃 렌더링
  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더 (상단 네비게이션 바) */}
      <Header isLoggedIn={!!session} />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
} 