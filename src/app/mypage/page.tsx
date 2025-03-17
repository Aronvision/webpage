'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Calendar, 
  Bell, 
  Globe, 
  Moon, 
  Volume2, 
  Eye, 
  ChevronRight, 
  Edit, 
  LogOut 
} from 'lucide-react';

export default function MyPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  // 사용자 정보 (실제로는 API에서 가져올 것)
  const userInfo = {
    name: session?.user?.name || '사용자',
    email: session?.user?.email || 'user@example.com',
    phone: '010-1234-5678',
    joinDate: '2023-01-15',
    profileImage: session?.user?.image || 'https://picsum.photos/200/200?5',
  };

  // 예약 이력 데이터 (실제로는 API에서 가져올 것)
  const reservations = [
    {
      id: 1,
      date: '2023-05-15',
      time: '14:30',
      destination: '제1터미널 A 게이트',
      status: '완료',
    },
    {
      id: 2,
      date: '2023-05-20',
      time: '10:15',
      destination: '제2터미널 면세점',
      status: '취소',
    },
    {
      id: 3,
      date: '2023-06-01',
      time: '16:45',
      destination: '제1터미널 출국장',
      status: '예정',
    },
    {
      id: 4,
      date: '2023-06-10',
      time: '09:30',
      destination: '제2터미널 입국장',
      status: '예정',
    },
  ];

  // 설정 옵션 (실제로는 API에서 가져오고 저장할 것)
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: '한국어',
    soundEffects: true,
    highContrast: false,
  });

  // 상태 배지 스타일 함수
  const getStatusStyle = (status) => {
    switch(status) {
      case '완료':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case '취소':
        return 'bg-red-50 text-red-700 border border-red-200';
      case '예정':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

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
                마이페이지
              </h1>
              <p className="text-neutral-500">
                개인 정보 관리 및 예약 이력을 확인하세요
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="container mx-auto p-6 relative">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIvPjwvZz48L3N2Zz4=')] bg-[size:24px_24px] opacity-50 pointer-events-none"></div>
        
        {/* 탭 컨텐츠 */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <Tabs 
            defaultValue="profile" 
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="text-sm md:text-base">
                <User className="w-4 h-4 mr-2 hidden md:inline" />
                프로필
              </TabsTrigger>
              <TabsTrigger value="reservations" className="text-sm md:text-base">
                <Calendar className="w-4 h-4 mr-2 hidden md:inline" />
                예약 이력
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm md:text-base">
                <Settings className="w-4 h-4 mr-2 hidden md:inline" />
                설정
              </TabsTrigger>
            </TabsList>

            {/* 프로필 탭 */}
            <TabsContent value="profile">
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* 프로필 카드 */}
                <Card className="border-none shadow-lg hover:shadow-xl transition-all md:col-span-1 bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                        <AvatarImage src={userInfo.profileImage} alt={userInfo.name} />
                        <AvatarFallback className="text-2xl bg-primary-100 text-primary-700">
                          {userInfo.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-2xl">{userInfo.name}</CardTitle>
                    <CardDescription>{userInfo.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex justify-center mt-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="outline" 
                          className="border-primary-200 text-primary-700 hover:bg-primary-50"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          프로필 수정
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                {/* 개인 정보 카드 */}
                <Card className="border-none shadow-lg hover:shadow-xl transition-all md:col-span-2 bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <User className="w-5 h-5 mr-2 text-primary-500" />
                      개인 정보
                    </CardTitle>
                    <CardDescription>회원 정보 및 연락처</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-500">이름</p>
                          <p className="text-neutral-900 font-medium">{userInfo.name}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-500">이메일</p>
                          <p className="text-neutral-900">{userInfo.email}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-500">연락처</p>
                          <p className="text-neutral-900">{userInfo.phone}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-neutral-500">가입일</p>
                          <p className="text-neutral-900">{format(new Date(userInfo.joinDate), 'PPP', { locale: ko })}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 최근 활동 카드 */}
                <Card className="border-none shadow-lg hover:shadow-xl transition-all md:col-span-3 bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary-500" />
                      최근 활동
                    </CardTitle>
                    <CardDescription>지난 30일 간의 활동 내역</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center">
                      <div className="flex space-x-2 items-end">
                        {[35, 45, 30, 65, 50, 75, 60, 40, 55, 70, 45, 30].map((height, i) => (
                          <motion.div
                            key={i}
                            className="bg-primary-100 rounded-t w-6 md:w-8"
                            initial={{ height: 0 }}
                            animate={{ height: `${height}px` }}
                            transition={{ 
                              delay: i * 0.05,
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
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* 예약 이력 탭 */}
            <TabsContent value="reservations">
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                      예약 이력
                    </CardTitle>
                    <CardDescription>지금까지의 모든 예약 내역을 확인하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">날짜</TableHead>
                            <TableHead className="w-[100px]">시간</TableHead>
                            <TableHead>목적지</TableHead>
                            <TableHead className="text-right">상태</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reservations.map((reservation) => (
                            <TableRow key={reservation.id}>
                              <TableCell className="font-medium">{reservation.date}</TableCell>
                              <TableCell>{reservation.time}</TableCell>
                              <TableCell>{reservation.destination}</TableCell>
                              <TableCell className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(reservation.status)}`}>
                                  {reservation.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          variant="outline" 
                          className="border-primary-200 text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                        >
                          새 예약 만들기
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* 설정 탭 */}
            <TabsContent value="settings">
              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-primary-500" />
                      설정
                    </CardTitle>
                    <CardDescription>알림, 언어, 접근성 등의 설정을 관리하세요</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* 알림 설정 */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-primary-500" />
                            <h3 className="text-base font-medium">알림 설정</h3>
                          </div>
                          <p className="text-sm text-neutral-500">
                            예약 및 공지사항 알림을 받습니다
                          </p>
                        </div>
                        <Switch
                          checked={settings.notifications}
                          onCheckedChange={(checked) => 
                            setSettings({...settings, notifications: checked})
                          }
                        />
                      </div>

                      {/* 다크 모드 */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Moon className="w-4 h-4 mr-2 text-primary-500" />
                            <h3 className="text-base font-medium">다크 모드</h3>
                          </div>
                          <p className="text-sm text-neutral-500">
                            어두운 테마로 화면을 표시합니다
                          </p>
                        </div>
                        <Switch
                          checked={settings.darkMode}
                          onCheckedChange={(checked) => 
                            setSettings({...settings, darkMode: checked})
                          }
                        />
                      </div>

                      {/* 언어 설정 */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-2 text-primary-500" />
                            <h3 className="text-base font-medium">언어 설정</h3>
                          </div>
                          <p className="text-sm text-neutral-500">
                            현재 언어: {settings.language}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          변경
                        </Button>
                      </div>

                      {/* 소리 효과 */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Volume2 className="w-4 h-4 mr-2 text-primary-500" />
                            <h3 className="text-base font-medium">소리 효과</h3>
                          </div>
                          <p className="text-sm text-neutral-500">
                            알림 및 상호작용 소리를 활성화합니다
                          </p>
                        </div>
                        <Switch
                          checked={settings.soundEffects}
                          onCheckedChange={(checked) => 
                            setSettings({...settings, soundEffects: checked})
                          }
                        />
                      </div>

                      {/* 고대비 모드 */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-2 text-primary-500" />
                            <h3 className="text-base font-medium">고대비 모드</h3>
                          </div>
                          <p className="text-sm text-neutral-500">
                            시각적 접근성을 높이기 위한 고대비 화면
                          </p>
                        </div>
                        <Switch
                          checked={settings.highContrast}
                          onCheckedChange={(checked) => 
                            setSettings({...settings, highContrast: checked})
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          className="bg-primary-500 hover:bg-primary-600 text-white"
                        >
                          설정 저장
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

// Activity 컴포넌트 정의 (lucide-react에서 가져오지 않은 경우)
const Activity = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}; 