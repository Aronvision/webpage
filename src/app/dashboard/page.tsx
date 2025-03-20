'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Map, MapPin, Clock, ChevronRight, Activity, Home, List, LayoutDashboard, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 디버깅을 위한 세션 상태 로깅
  useEffect(() => {
    console.log("대시보드 페이지 - 세션 상태:", status);
    console.log("대시보드 페이지 - 세션 데이터:", session);
  }, [status, session]);

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log("인증되지 않음, 로그인 페이지로 리디렉션");
      router.push('/login');
    }
  }, [status, router]);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // 로딩 중이거나 인증되지 않은 경우 표시
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">페이지 로딩 중...</p>
      </div>
    );
  }

  // 인증되지 않은 상태인 경우 반환하지 않음 (useEffect에서 리디렉션됨)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">인증이 필요한 페이지입니다. 로그인 페이지로 이동합니다...</p>
      </div>
    );
  }

  // 애니메이션 변수
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  // 예약 데이터 (실제로는 API에서 가져올 것)
  const reservations = [
    {
      id: 1,
      date: '2023-05-15',
      time: '14:30',
      destination: '제1터미널 A 게이트',
      status: '예약 완료',
    },
    {
      id: 2,
      date: '2023-05-20',
      time: '10:15',
      destination: '제2터미널 면세점',
      status: '진행 중',
    },
  ];

  // 공지사항 데이터 (실제로는 API에서 가져올 것)
  const notices = [
    {
      id: 1,
      title: '시스템 업데이트 안내',
      content: '5월 15일 오전 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
      date: '2023-05-10',
    },
    {
      id: 2,
      title: '신규 로봇 도입 안내',
      content: '제2터미널에 신규 모빌리티 로봇 10대가 추가 배치되었습니다.',
      date: '2023-05-08',
    },
  ];

  // 상태 배지 스타일 함수
  const getStatusStyle = (status) => {
    switch(status) {
      case '예약 완료':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case '진행 중':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
      {/* 헤더 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm mt-0 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-1">
                안녕하세요, {session?.user?.name || '사용자'}님!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 flex items-center">
                <span>{format(currentTime, 'PPP EEEE', { locale: ko })}</span>
                <span className="mx-1 md:mx-2">•</span>
                <span>{format(currentTime, 'p', { locale: ko })}</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              {/* 네비게이션 버튼들 - 우측 정렬 */}
              <div className="hidden md:flex items-center mr-2 space-x-1">
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:text-primary-600 hover:bg-primary-50 px-2"
                  onClick={() => router.push('/')}
                >
                  <Home className="w-4 h-4 mr-1" />
                  홈
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:text-primary-600 hover:bg-primary-50 font-medium px-2"
                  onClick={() => router.push('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  대시보드
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:text-primary-600 hover:bg-primary-50 font-medium px-2"
                  onClick={() => router.push('/reservations')}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  예약관리
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:text-primary-600 hover:bg-primary-50 font-medium px-2"
                  onClick={() => router.push('/map')}
                >
                  <Map className="w-4 h-4 mr-1" />
                  지도
                </Button>
              </div>
            
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto"
                >
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all w-full md:w-auto text-xs sm:text-sm py-2 h-auto"
                    onClick={() => router.push('/reservations/new')}
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    새 예약 만들기
                  </Button>
                </motion.div>
                
                {/* 모바일 메뉴 토글 버튼 */}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="md:hidden border-neutral-200"
                  onClick={() => alert('모바일 메뉴는 준비 중입니다.')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 relative max-w-[100%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-5xl">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIvPjwvZz48L3N2Zz4=')] bg-[size:24px_24px] opacity-50 pointer-events-none"></div>
        
        {/* 빠른 예약과 바로 사용하기 카드 - 모바일에서는 세로, 태블릿 이상에서는 가로 배치 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative z-10 mb-4 sm:mb-6">
          {/* 빠른 예약 카드 */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-500 to-blue-600 text-white backdrop-blur-sm ring-1 ring-blue-400/20">
              <div className="flex flex-col sm:flex-row sm:items-center h-full">
                <CardHeader className="pb-0 sm:pb-0 px-4 sm:px-6 pt-4 sm:pt-4 sm:flex-1">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 opacity-90" />
                    빠른 예약
                  </CardTitle>
                  <CardDescription className="text-xs text-blue-100">지금 바로 모빌리티 로봇을 예약하세요</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-4 sm:pt-4 flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button 
                      className="w-full bg-white/90 text-blue-800 hover:bg-white font-medium shadow-md text-xs sm:text-sm py-2 h-auto whitespace-nowrap"
                      onClick={() => router.push('/reservations/new')}
                    >
                      지금 예약하기
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </Button>
                  </motion.div>
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* 바로 사용하기 카드 */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <Card className="h-full overflow-hidden border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-cyan-500 to-cyan-600 text-white backdrop-blur-sm ring-1 ring-cyan-400/20">
              <div className="flex flex-col sm:flex-row sm:items-center h-full">
                <CardHeader className="pb-0 sm:pb-0 px-4 sm:px-6 pt-4 sm:pt-4 sm:flex-1">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 opacity-90" />
                    바로 사용하기
                  </CardTitle>
                  <CardDescription className="text-xs text-cyan-100">대기 없이 바로 모빌리티 로봇을 이용하세요</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-4 sm:pt-4 flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    <Button 
                      className="w-full bg-white/90 text-cyan-800 hover:bg-white font-medium shadow-md text-xs sm:text-sm py-2 h-auto whitespace-nowrap"
                      onClick={() => router.push('/instant-use')}
                    >
                      바로 사용하기
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    </Button>
                  </motion.div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* 예약 내역 섹션 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mb-4 sm:mb-6"
        >
          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-xl flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-500" />
                  예약 내역
                </CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:text-primary-600 text-xs sm:text-sm h-8"
                  onClick={() => router.push('/reservations')}
                >
                  모두 보기
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                최근 예약 현황을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                {reservations.map((reservation) => (
                  <motion.div 
                    key={reservation.id}
                    variants={itemVariants}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm sm:text-base font-medium text-neutral-900 mb-1">
                          {reservation.destination}
                        </p>
                        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 text-xs sm:text-sm text-neutral-500">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-neutral-400" />
                            {reservation.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-neutral-400" />
                            {reservation.time}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${getStatusStyle(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>
                    <div className="flex justify-end mt-1">
                      <Button 
                        variant="ghost" 
                        className="text-xs sm:text-sm h-7 sm:h-8 text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 sm:px-3"
                        onClick={() => router.push(`/reservations/${reservation.id}`)}
                      >
                        상세보기
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 공지사항 섹션 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mb-4 sm:mb-6"
        >
          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-xl flex items-center">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-500" />
                  공지사항
                </CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:text-primary-600 text-xs sm:text-sm h-8"
                  onClick={() => router.push('/notices')}
                >
                  모두 보기
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                서비스 관련 중요 공지사항을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-3 sm:space-y-4">
                {notices.map((notice) => (
                  <motion.div 
                    key={notice.id}
                    variants={itemVariants}
                    className="border-b border-neutral-200 pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm sm:text-base font-medium text-neutral-900 mb-1 line-clamp-1">
                      {notice.title}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-600 mb-2 line-clamp-2">
                      {notice.content}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500">{notice.date}</span>
                      <Button 
                        variant="ghost" 
                        className="text-xs sm:text-sm h-7 sm:h-8 text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-2 sm:px-3"
                        onClick={() => router.push(`/notices/${notice.id}`)}
                      >
                        자세히
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 사용량 통계 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mb-6"
        >
          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-xl flex items-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-500" />
                이용 통계
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                서비스 이용 현황을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-blue-800 text-xs sm:text-sm mb-1">총 이용 횟수</p>
                  <p className="text-blue-900 text-xl sm:text-2xl font-bold">3회</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-emerald-800 text-xs sm:text-sm mb-1">이동 거리</p>
                  <p className="text-emerald-900 text-xl sm:text-2xl font-bold">2.5km</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-amber-800 text-xs sm:text-sm mb-1">이용 시간</p>
                  <p className="text-amber-900 text-xl sm:text-2xl font-bold">45분</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-purple-800 text-xs sm:text-sm mb-1">절약 시간</p>
                  <p className="text-purple-900 text-xl sm:text-2xl font-bold">15분</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* 공항 지도 컴포넌트 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 mb-6"
        >
          <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-xl flex items-center">
                  <Map className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-500" />
                  공항 지도
                </CardTitle>
                <Button 
                  variant="ghost" 
                  className="text-neutral-600 hover:text-primary-600 text-xs sm:text-sm h-8"
                  onClick={() => router.push('/map')}
                >
                  전체 지도 보기
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                공항 내 위치와 로봇 배치 현황을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden border border-neutral-200">
                <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image 
                      src="https://picsum.photos/800/400?2" 
                      alt="공항 지도" 
                      fill
                      sizes="(max-width: 768px) 100vw, 800px"
                      className="object-cover opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-md">
                        <p className="text-xs sm:text-sm font-medium text-neutral-900 flex items-center">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-red-500" />
                          현재 위치: 제1터미널 출국장
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-white text-primary-700 border-primary-200 hover:bg-primary-50"
                >
                  제1터미널
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-white text-primary-700 border-primary-200 hover:bg-primary-50"
                >
                  제2터미널
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-white text-primary-700 border-primary-200 hover:bg-primary-50"
                >
                  교통 센터
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs bg-white text-primary-700 border-primary-200 hover:bg-primary-50"
                >
                  면세점
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 