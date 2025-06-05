'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface UseAuthCheckOptions {
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * 인증 상태를 확인하는 커스텀 훅
 * 인증되지 않은 경우 지정된 경로로 리다이렉트하고 선택적으로 토스트를 표시함
 */
export function useAuthCheck({
  redirectTo = '/login',
  showToast = true,
}: UseAuthCheckOptions = {}) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 로딩 상태인 경우 아직 확인 중
    if (status === 'loading') return;
    
    // 인증되지 않은 경우
    if (status === 'unauthenticated') {
      
      if (showToast) {
        toast({
          title: '로그인이 필요합니다',
          description: '이 페이지에 접근하려면 로그인이 필요합니다.',
          variant: 'destructive',
        });
      }
      
      // 로그인 페이지로 리다이렉션
      router.push(redirectTo);
    } else {
      // 인증된 경우
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [status, router, toast, redirectTo, showToast]);

  return { isLoading, isAuthenticated, session, status };
} 