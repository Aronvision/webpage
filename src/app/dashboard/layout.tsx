'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      toast({
        title: '로그인이 필요합니다',
        description: '대시보드에 접근하려면 로그인이 필요합니다.',
        variant: 'destructive',
      });
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [status, router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">로딩 중...</p>
      </div>
    );
  }

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