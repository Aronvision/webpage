'use client';
export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // 이미 로그인된 경우 대시보드로 리디렉션
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // 로그인 성공 후 리디렉션
  useEffect(() => {
    if (isRedirecting && status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [isRedirecting, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      setLoginError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      });
      
      
      if (!result?.ok) {
        // 로그인 실패
        console.error('로그인 실패:', result?.error);
        
        // 에러 메시지 상태 설정
        setLoginError(result?.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        // 로그인 성공
        setLoginError(null);
        
        // 리디렉션 플래그 설정
        setIsRedirecting(true);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
      
      // 에러 메시지 상태 설정
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="p-4 sm:p-6 shadow-lg">
            <div className="mb-4 sm:mb-6 text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">로그인</h1>
              <p className="text-sm text-neutral-500 mt-1 sm:mt-2">계정 정보를 입력하여 로그인하세요</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isRedirecting}
                  required
                  className="w-full text-sm sm:text-base"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link href="/forgot-password" className="text-xs sm:text-sm text-primary-500 hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isRedirecting}
                  required
                  className="w-full text-sm sm:text-base"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading || isRedirecting}
                />
                <Label htmlFor="remember" className="text-xs sm:text-sm font-normal cursor-pointer">
                  로그인 상태 유지
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary-500 hover:bg-primary-700 text-white text-sm sm:text-base py-2 sm:py-6 h-auto"
                disabled={isLoading || isRedirecting}
              >
                {isLoading ? '로그인 중...' : isRedirecting ? '이동 중...' : '로그인'}
              </Button>

              {/* 로그인 오류 메시지 */}
              {loginError && (
                <div className="p-2 sm:p-3 mt-2 sm:mt-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm">
                  {loginError}
                </div>
              )}
            </form>
            
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-neutral-500">
                계정이 없으신가요?{' '}
                <Link href="/signup" className="text-primary-500 hover:underline">
                  회원가입
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* 이미지 배경 (데스크톱에서만 표시) */}
      <div className="fixed inset-0 -z-10 hidden md:block relative">
        <Image
          src="https://picsum.photos/400/300?2"
          alt="로그인 배경 이미지"
          fill
          className="object-cover opacity-10"
        />
      </div>

      {/* Footer */}
      <Footer />

      {/* Toaster */}
      <Toaster />
    </div>
  );
} 