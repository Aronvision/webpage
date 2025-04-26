'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, ChevronLeft, Clock, Phone, Info, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFacility } from '@/features/facilities/hooks/useFacility';
import { categoryInfo } from '@/features/facilities/types';

// React Query 클라이언트 생성
const queryClient = new QueryClient();

// 시설 상세 페이지 래퍼 컴포넌트
export default function FacilityDetailPageWrapper({ params }) {
  return (
    <QueryClientProvider client={queryClient}>
      <FacilityDetailPage params={params} />
    </QueryClientProvider>
  );
}

// 시설 상세 페이지 컴포넌트
function FacilityDetailPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [luggageDialogOpen, setLuggageDialogOpen] = useState(false);
  const [safetySeatDialogOpen, setSafetySeatDialogOpen] = useState(false);

  // 시설 데이터 가져오기
  const { facility, isLoading, isError } = useFacility(params.id);

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

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 에러 표시
  if (isError || !facility) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
        <div className="text-center">
          <p className="text-red-500 mb-4">시설 정보를 불러오는 중 오류가 발생했습니다.</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/map')}
          >
            지도로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const categoryStyle = categoryInfo[facility.category]?.color || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
      {/* 헤더 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm"
      >
        <div className="container mx-auto px-4 py-3 sm:p-6">
          <div className="flex items-center flex-wrap">
            <Button 
              variant="ghost" 
              className="mr-2 p-1 sm:p-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 mr-2 line-clamp-1">{facility.name}</h1>
            <Badge className={`mt-1 sm:mt-0 ${categoryStyle}`}>
              {categoryInfo[facility.category]?.name || '기타'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-4 sm:p-6">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 이미지 갤러리 */}
          <motion.div 
            className="lg:col-span-2"
            variants={itemVariants}
          >
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative w-full h-60 sm:h-80 md:h-96">
                  <Image
                    src={facility.images[activeImageIndex] || 'https://picsum.photos/800/600?placeholder'}
                    alt={facility.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                    priority
                  />
                </div>
                <div className="p-2 sm:p-4 flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-primary-200 scrollbar-track-transparent">
                  {facility.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`relative min-w-16 w-16 h-16 sm:min-w-20 sm:w-20 sm:h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                        activeImageIndex === index ? 'border-primary-500' : 'border-transparent'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`${facility.name} 이미지 ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 시설 정보 */}
          <motion.div 
            variants={itemVariants}
          >
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* 위치 정보 */}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-800">위치</h3>
                      <p className="text-neutral-600 break-words">{facility.location}</p>
                    </div>
                  </div>

                  {/* 운영 시간 */}
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-800">운영 시간</h3>
                      <p className="text-neutral-600 break-words">{facility.operating_hours || '정보 없음'}</p>
                    </div>
                  </div>

                  {/* 연락처 */}
                  {facility.phone && (
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-800">연락처</h3>
                        <p className="text-neutral-600 break-words">{facility.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* 웹사이트 */}
                  {facility.website && (
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-800">웹사이트</h3>
                        <a 
                          href={facility.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline break-words inline-block"
                        >
                          {facility.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 평점 */}
                  {facility.rating !== undefined && (
                    <div className="flex items-start">
                      <Star className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-800">평점</h3>
                        <div className="flex items-center flex-wrap">
                          <div className="flex mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${
                                  star <= Math.floor(facility.rating) 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : star <= facility.rating 
                                      ? 'text-yellow-400 fill-yellow-400 opacity-50' 
                                      : 'text-neutral-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm sm:text-base text-neutral-600">
                            {facility.rating} ({facility.reviews || 0}개 리뷰)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 예약 버튼 */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-2 sm:pt-4"
                  >
                    <Button 
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium shadow-md"
                      onClick={() => setConfirmDialogOpen(true)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="truncate">목적지 설정하기</span>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 시설 설명 */}
          <motion.div 
            className="lg:col-span-3"
            variants={itemVariants}
          >
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-2 sm:mb-4">시설 정보</h2>
                <p className="text-neutral-600 leading-relaxed">{facility.description || '상세 정보가 없습니다.'}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {/* 이동 확인 다이얼로그 */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">해당 위치로 이동하시겠어요?</DialogTitle>
            <DialogDescription className="text-center">
              {facility?.name}(으)로 이동할 준비가 되셨나요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-4 sm:justify-center">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              아니요
            </Button>
            <Button 
              onClick={() => {
                setConfirmDialogOpen(false);
                setTimeout(() => setLuggageDialogOpen(true), 300);
              }}
            >
              예
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 짐 안내 다이얼로그 */}
      <Dialog open={luggageDialogOpen} onOpenChange={setLuggageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">짐을 넣어주세요</DialogTitle>
            <DialogDescription className="text-center">
              이동을 시작하기 전에 짐을 안전하게 보관함에 넣어주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button onClick={() => {
              setLuggageDialogOpen(false);
              setTimeout(() => setSafetySeatDialogOpen(true), 300);
            }}>
              완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 안전 확인 다이얼로그 */}
      <Dialog open={safetySeatDialogOpen} onOpenChange={setSafetySeatDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">안전 확인</DialogTitle>
            <DialogDescription className="text-center py-2">
              짐을 안전하게 보관하시고 좌석에 안정적으로 탑승하셨는지 확인해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center pt-2">
            <Button 
              onClick={() => setSafetySeatDialogOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              안내 시작
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 