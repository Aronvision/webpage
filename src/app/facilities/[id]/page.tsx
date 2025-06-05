'use client';

import { useState, useEffect, useRef } from 'react';
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
import mqtt, { IClientOptions, MqttClient } from 'mqtt';

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
  const [isConnectingMqtt, setIsConnectingMqtt] = useState(false);
  const mqttClientRef = useRef<MqttClient | null>(null);

  // MQTT 연결 설정 (환경 변수 사용 권장)
  const mqttBrokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'ws://your_broker_address:9001';
  const mqttOptions: Omit<IClientOptions, 'host' | 'port' | 'protocol'> = {
    username: process.env.NEXT_PUBLIC_MQTT_USERNAME || 'your_username',
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || 'your_password',
    clientId: `facility_page_${params.id}_${Math.random().toString(16).substr(2, 8)}`,
    connectTimeout: 5000,
  };

  // 시설 데이터 가져오기
  const { facility, isLoading, isError } = useFacility(params.id);

  // 카테고리별 관련 이미지 매핑
  const getCategoryImages = (category: string, facilityName: string, floor?: string) => {
    // 3F 시설들은 public 디렉토리의 이미지를 사용
    if (floor === '3F') {
      // 시설 이름에 따라 다른 이미지 사용
      let imagePath = '/면세점.png'; // 기본값
      
      if (facilityName.includes('스타벅스')) {
        imagePath = '/스타벅스.webp';
      } else if (facilityName.includes('롯데면세점')) {
        imagePath = '/면세점.png';
      } else if (facilityName.includes('A1') || facilityName.includes('게이트')) {
        imagePath = '/a1게이트.png';
      }
      
      // 동일한 이미지를 5개 슬롯에 사용
      const localImages = [
        imagePath,
        imagePath,
        imagePath,
        imagePath,
        imagePath
      ];
      
      return localImages.map(path => ({
        full: path,
        thumbnail: path
      }));
    }

    // 3F가 아닌 시설들은 기존처럼 랜덤 이미지 사용
    const baseUrl = 'https://picsum.photos/800/600';
    const thumbnailUrl = 'https://picsum.photos/300/300';
    
    // 카테고리별 시드 번호 (일관된 이미지를 위해)
    const categorySeeds = {
      'cafe': [431, 500, 504, 513, 524], // 커피, 음료 관련 이미지
      'restaurant': [292, 376, 490, 505, 569], // 음식 관련 이미지
      'shop': [48, 129, 162, 305, 441], // 쇼핑, 상점 관련 이미지
      'medical': [786, 832, 847, 935, 1074], // 의료, 건강 관련 이미지
      'wifi': [365, 326, 367, 404, 518], // 기술, 인터넷 관련 이미지
      'phone': [256, 342, 393, 445, 507], // 통신, 전화 관련 이미지
      'babycare': [177, 203, 239, 274, 349], // 아기, 가족 관련 이미지
      'accessibility': [593, 623, 659, 732, 804], // 접근성, 도움 관련 이미지
      'gate': [436, 502, 564, 625, 683], // 공항, 여행 관련 이미지
    };

    const seeds = categorySeeds[category] || [100, 200, 300, 400, 500];
    
    return seeds.map((seed, index) => ({
      full: `${baseUrl}?random=${seed}`,
      thumbnail: `${thumbnailUrl}?random=${seed}`
    }));
  };

  // 컴포넌트 언마운트 시 MQTT 연결 해제
  useEffect(() => {
    return () => {
      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.end(true, () => {
          console.log('MQTT client disconnected on facility page unmount.');
        });
      }
    };
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
  
  // 시설 카테고리에 맞는 이미지 가져오기
  const facilityImages = getCategoryImages(facility.category, facility.name, facility.floor);

  // 안내 시작 및 MQTT 발행 핸들러 (컴포넌트 내부로 이동)
  async function handleStartNavigationAndPublish() {
    setSafetySeatDialogOpen(false); // 다이얼로그 닫기
    router.push(`/navigation/${params.id}`); // 페이지 즉시 이동

    // MQTT 발행 (비동기)
    setIsConnectingMqtt(true);
    console.log('Attempting to publish navigation start message...');

    try {
      // 기존 연결 확인 및 필요시 재연결
      if (!mqttClientRef.current || !mqttClientRef.current.connected) {
        console.log('Connecting to MQTT broker...');
        // 주의: connect는 비동기가 아니지만, 이벤트 기반으로 연결 완료를 확인해야 함
        const client = mqtt.connect(mqttBrokerUrl, mqttOptions);
        mqttClientRef.current = client;

        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            console.error('MQTT connection timed out.');
            client.end(true); // 연결 강제 종료
            reject(new Error('Connection timeout'));
          }, mqttOptions.connectTimeout || 5000); // 설정된 타임아웃 사용

          client.on('connect', () => {
            clearTimeout(timeoutId);
            console.log('Successfully connected to MQTT broker.');
            resolve();
          });

          client.on('error', (err) => {
            clearTimeout(timeoutId);
            console.error('MQTT Connection Error:', err.message);
            client.end(true); // 연결 강제 종료
            reject(err); // 에러를 reject하여 catch 블록에서 처리
          });
        });
      }

      // 연결 성공 확인 후 메시지 발행
      if (mqttClientRef.current?.connected) {
        const topic = 'navigation/start';
        const message = JSON.stringify({
          command: 'start_navigation',
          facilityId: params.id,
          facilityName: facility.name,
          facilityNum: facility.num,
          timestamp: new Date().toISOString(),
        });

        // publish는 콜백 또는 Promise를 반환하지 않으므로, 완료 확인 어려움
        // fire-and-forget 방식으로 발행 시도
        mqttClientRef.current.publish(topic, message, { qos: 0, retain: false }, (err) => {
          if (err) {
            console.error('MQTT Publish Error:', err.message);
            // 발행 실패는 네비게이션에 영향을 주지 않음
          } else {
            console.log(`Successfully published to topic ${topic}: ${message}`);
            // 발행 성공 후 연결 유지 또는 종료 결정 (여기서는 유지)
          }
        });
      } else {
         console.warn('MQTT client not connected, skipping publish.');
      }

    } catch (error) {
      // 연결 실패 시 에러 로깅
      console.error('MQTT operation failed:', error instanceof Error ? error.message : String(error));
      // 오류가 발생해도 네비게이션은 이미 수행되었으므로 사용자에게 직접 알리지 않음
    } finally {
      setIsConnectingMqtt(false); // 로딩 상태 해제
    }
  }

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
                    src={facilityImages[activeImageIndex]?.full || 'https://picsum.photos/800/600?random=100'}
                    alt={`${facility.name} - ${categoryInfo[facility.category]?.name || facility.category} 시설`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                    priority
                  />
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
              onClick={handleStartNavigationAndPublish}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isConnectingMqtt}
            >
              {isConnectingMqtt ? '처리 중...' : '안내 시작'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 