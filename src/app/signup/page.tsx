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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    
    // 입력값 검증
    if (!email || !password || !confirmPassword || !name) {
      setSignupError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (password !== confirmPassword) {
      setSignupError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    
    if (!agreeTerms) {
      setSignupError('이용약관에 동의해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // API 호출 부분
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      
      // 응답 처리 개선
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      
      try {
        // JSON 응답 파싱 시도
        const data = await response.json();
        // 서버에서 보낸 에러 메시지가 있으면 사용
        errorMessage = data.message || data.error || errorMessage;
      } catch (parseError) {
        // JSON 파싱 실패 시 HTTP 응답 텍스트 사용 시도
        try {
          const textResponse = await response.text();
          // 텍스트 응답이 있으면 사용 (일부만 표시)
          if (textResponse) {
            // 긴 오류 메시지는 간결하게 표시
            errorMessage = textResponse.length > 100 
              ? textResponse.substring(0, 100) + '...' 
              : textResponse;
            
            // "Error: " 형식의 메시지에서 실제 오류 메시지만 추출
            if (errorMessage.startsWith('Error:')) {
              errorMessage = errorMessage.substring('Error:'.length).trim();
            }
          }
        } catch (textError) {
          // 텍스트 읽기도 실패한 경우 기본 오류 메시지 사용
          errorMessage = '회원가입 요청 처리 중 오류가 발생했습니다.';
        }
      }
      
      if (!response.ok) {
        // HTTP 상태 코드에 따른 메시지 추가
        const statusMessage = getStatusErrorMessage(response.status);
        throw new Error(statusMessage ? `${errorMessage} (${statusMessage})` : errorMessage);
      }
      
      // 회원가입 성공 시 로그인 페이지로 이동
      router.push('/login?registered=true');
      
    } catch (error) {
      console.error('회원가입 오류:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '회원가입 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.';
      
      setSignupError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // HTTP 상태 코드에 따른 사용자 친화적인 오류 메시지 반환
  function getStatusErrorMessage(status: number): string {
    switch (status) {
      case 400: return '잘못된 요청입니다';
      case 401: return '인증에 실패했습니다';
      case 403: return '접근이 거부되었습니다';
      case 404: return '요청한 리소스를 찾을 수 없습니다';
      case 409: return '이미 사용 중인 이메일입니다';
      case 422: return '제공된 정보가 유효하지 않습니다';
      case 500: return '서버 내부 오류가 발생했습니다';
      default: return status >= 500 
        ? '서버 오류가 발생했습니다' 
        : '요청을 처리할 수 없습니다';
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="p-6 shadow-lg">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-neutral-900">회원가입</h1>
              <p className="text-neutral-500 mt-2">계정 정보를 입력하여 회원가입하세요</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  <span>이용약관 및 개인정보 처리방침에 동의합니다.</span>
                  {' '}<Link href="/terms" className="text-primary-500 hover:underline">약관 보기</Link>
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary-500 hover:bg-primary-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </Button>
              
              {/* 회원가입 오류 메시지 */}
              {signupError && (
                <div className="p-3 mt-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {signupError}
                </div>
              )}
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-500">
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
    </div>
  );
} 