'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Map, MapPin, Clock, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
      {/* 헤더 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm mt-0"
      >
        <div className="container mx-auto p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-1">
                안녕하세요, {session?.user?.name || '사용자'}님!
              </h1>
              <p className="text-neutral-500 flex items-center">
                <span>{format(currentTime, 'PPP EEEE', { locale: ko })}</span>
                <span className="mx-2">•</span>
                <span>{format(currentTime, 'p', { locale: ko })}</span>
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => router.push('/reservations/new')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                새 예약 만들기
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto p-6 relative">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIvPjwvZz48L3N2Zz4=')] bg-[size:24px_24px] opacity-50 pointer-events-none"></div>
        
        {/* 대시보드 그리드 */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 빠른 예약 카드 */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-primary-500 to-primary-600 text-white backdrop-blur-sm ring-1 ring-primary-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="w-5 h-5 mr-2 opacity-90" />
                  빠른 예약
                </CardTitle>
                <CardDescription className="text-primary-100">지금 바로 모빌리티 로봇을 예약하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="w-full bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium shadow-md"
                    onClick={() => router.push('/reservations/new')}
                  >
                    지금 예약하기
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 예약 현황 카드 */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-500" />
                  예약 현황
                </CardTitle>
                <CardDescription>최근 예약 내역을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reservations.length > 0 ? (
                    reservations.map((reservation, index) => (
                      <motion.div 
                        key={reservation.id} 
                        className="border-b pb-3 last:border-0 last:pb-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 3 }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-neutral-800">{reservation.destination}</p>
                            <p className="text-sm text-neutral-500">
                              {reservation.date} {reservation.time}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-neutral-500 text-center py-2">예약 내역이 없습니다</p>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4"
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                    onClick={() => router.push('/reservations')}
                  >
                    모든 예약 보기
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 공지사항 카드 */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary-500" />
                  공지사항
                </CardTitle>
                <CardDescription>최신 소식과 업데이트를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notices.map((notice, index) => (
                    <motion.div 
                      key={notice.id} 
                      className="border-b pb-3 last:border-0 last:pb-0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 3 }}
                    >
                      <p className="font-medium text-neutral-800">{notice.title}</p>
                      <p className="text-sm text-neutral-500 line-clamp-2">{notice.content}</p>
                      <p className="text-xs text-neutral-400 mt-1">{notice.date}</p>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4"
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                    onClick={() => router.push('/notices')}
                  >
                    모든 공지 보기
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 통계 카드 */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-primary-500" />
                  이용 통계
                </CardTitle>
                <CardDescription>지난 30일 간의 이용 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center">
                  <div className="flex space-x-2 items-end">
                    {[35, 45, 30, 65, 50, 75, 60].map((height, i) => (
                      <motion.div
                        key={i}
                        className="bg-primary-100 rounded-t w-8"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}px` }}
                        transition={{ 
                          delay: i * 0.1,
                          duration: 0.8,
                          type: "spring",
                          stiffness: 50
                        }}
                      >
                        <div className="h-full w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t" />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4"
                >
                  <Button 
                    variant="outline" 
                    className="w-full border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                    onClick={() => router.push('/statistics')}
                  >
                    상세 통계 보기
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 지도 미리보기 카드 */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Map className="w-5 h-5 mr-2 text-primary-500" />
                  공항 지도
                </CardTitle>
                <CardDescription>공항 내 위치 및 경로를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-72 bg-neutral-200 rounded-lg overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1542296332-2e4473faf563?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400&q=80"
                    alt="공항 지도 미리보기"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg"
                        onClick={() => router.push('/map')}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        지도 보기
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 