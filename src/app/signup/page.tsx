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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      agreeTerms: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: '회원가입 오류',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '비밀번호 오류',
        description: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.agreeTerms) {
      toast({
        title: '약관 동의 필요',
        description: '서비스 이용을 위해 약관에 동의해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Supabase에 사용자 등록
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // 회원가입 성공
      toast({
        title: '회원가입 성공',
        description: '로그인 페이지로 이동합니다.',
      });
      
      // 로그인 페이지로 리다이렉트
      router.push('/login');
    } catch (error) {
      console.error('회원가입 오류:', error);
      toast({
        title: '회원가입 실패',
        description: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
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
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="p-6 shadow-lg">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-neutral-900">회원가입</h1>
              <p className="text-neutral-500 mt-2">공항 모빌리티 서비스를 이용하기 위한 계정을 만드세요</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="이름을 입력하세요."
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="이메일을 입력하세요."
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요."
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
                <p className="text-xs text-neutral-500">8자 이상, 영문, 숫자, 특수문자를 포함해주세요.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요."
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="agreeTerms" 
                  checked={formData.agreeTerms}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                  required
                />
                <Label htmlFor="agreeTerms" className="text-sm font-normal cursor-pointer">
                  <span>
                    <Link href="/terms" className="text-primary-500 hover:underline">이용약관</Link>
                    {' '}및{' '}
                    <Link href="/privacy" className="text-primary-500 hover:underline">개인정보처리방침</Link>
                    에 동의합니다.
                  </span>
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary-500 hover:bg-primary-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </Button>
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