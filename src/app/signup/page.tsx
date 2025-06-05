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
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { registerUser } from '@/features/auth/client-api';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const validateForm = () => {
    // 입력값 검증
    if (!email || !password || !confirmPassword || !name) {
      setSignupError('모든 필드를 입력해주세요.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setSignupError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return false;
    }
    
    if (!agreeTerms) {
      setSignupError('이용약관에 동의해주세요.');
      return false;
    }

    if (password.length < 6) {
      setSignupError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    
    // 폼 유효성 검사
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // client-api의 registerUser 함수 사용
      const result = await registerUser({
        email,
        password,
        name
      });
      
      
      // 성공 토스트 메시지
      toast({
        title: "회원가입 성공",
        description: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
        variant: "default",
      });
      
      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/login?registered=true');
      
    } catch (error) {
      
      // 오류 메시지 처리
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 일반적인 오류 메시지를 사용자 친화적으로 변환
        if (errorMessage.includes('already exists')) {
          errorMessage = '이미 가입된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.';
        } else if (errorMessage.includes('invalid email')) {
          errorMessage = '유효하지 않은 이메일 형식입니다.';
        } else if (errorMessage.includes('서버 오류')) {
          errorMessage = '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      
      setSignupError(errorMessage);
      
      // 오류 토스트 메시지
      toast({
        title: "회원가입 실패",
        description: errorMessage,
        variant: "destructive",
      });
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
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">회원가입</h1>
              <p className="text-sm text-neutral-500 mt-1 sm:mt-2">계정 정보를 입력하여 회원가입하세요</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full text-sm sm:text-base"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full text-sm sm:text-base"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full text-sm sm:text-base"
                />
                <p className="text-xs text-neutral-500">비밀번호는 최소 6자 이상이어야 합니다.</p>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full text-sm sm:text-base"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-xs sm:text-sm font-normal cursor-pointer">
                  <span>이용약관 및 개인정보 처리방침에 동의합니다.</span>
                  {' '}<Link href="/terms" className="text-primary-500 hover:underline">약관 보기</Link>
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary-500 hover:bg-primary-700 text-white text-sm sm:text-base py-2 sm:py-6 h-auto"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </Button>
              
              {/* 회원가입 오류 메시지 */}
              {signupError && (
                <div className="p-2 sm:p-3 mt-2 sm:mt-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm">
                  {signupError}
                </div>
              )}
            </form>
            
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-neutral-500">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="text-primary-500 hover:underline">
                  로그인
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* 이미지 배경 (데스크톱에서만 표시) */}
      <div className="fixed inset-0 -z-10 hidden md:block relative">
        <Image
          src="https://picsum.photos/400/300?3"
          alt="회원가입 배경 이미지"
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