'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <div className="container mx-auto p-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2 p-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">{facility.name}</h1>
            <Badge className={`ml-3 ${categoryStyle}`}>
              {categoryInfo[facility.category]?.name || '기타'}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto p-6">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
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
                <div className="relative w-full h-96">
                  <Image
                    src={facility.images[activeImageIndex] || 'https://picsum.photos/800/600?placeholder'}
                    alt={facility.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {facility.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                        activeImageIndex === index ? 'border-primary-500' : 'border-transparent'
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`${facility.name} 이미지 ${index + 1}`}
                        fill
                        className="object-cover"
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
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* 위치 정보 */}
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-neutral-800">위치</h3>
                      <p className="text-neutral-600">{facility.location}</p>
                    </div>
                  </div>

                  {/* 운영 시간 */}
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-neutral-800">운영 시간</h3>
                      <p className="text-neutral-600">{facility.operatingHours || '정보 없음'}</p>
                    </div>
                  </div>

                  {/* 연락처 */}
                  {facility.phone && (
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-neutral-800">연락처</h3>
                        <p className="text-neutral-600">{facility.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* 웹사이트 */}
                  {facility.website && (
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-primary-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-neutral-800">웹사이트</h3>
                        <a 
                          href={facility.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
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
                      <div>
                        <h3 className="font-medium text-neutral-800">평점</h3>
                        <div className="flex items-center">
                          <div className="flex">
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
                          <span className="ml-2 text-neutral-600">
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
                    className="pt-4"
                  >
                    <Button 
                      className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium shadow-md"
                      onClick={() => router.push('/reservations/new')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      이 위치로 로봇 예약하기
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
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-4">시설 정보</h2>
                <p className="text-neutral-600 leading-relaxed">{facility.description || '상세 정보가 없습니다.'}</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 