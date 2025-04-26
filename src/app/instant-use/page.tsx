'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Battery, ChevronLeft, QrCode, ZoomIn, ZoomOut, Compass, X, Info, Clock, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useRosConnection } from '@/hooks/use-ros-connection';

interface MobilityDevice {
  id: string;
  name: string;
  type: 'BIKE' | 'KICKBOARD';
  batteryLevel: number;
  position: { x: number; y: number };
  available: boolean;
}

export default function InstantUsePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<MobilityDevice | null>(null);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  
  // ROS 연결 훅 사용
  const { 
    isConnected, 
    error: rosError, 
    sendFavoriteDevice,
    connect
  } = useRosConnection({
    url: 'ws://localhost:9090', // ROS 브릿지 서버 주소 설정
    autoConnect: true,
    reconnectInterval: 5000, // 5초마다 재연결 시도
    maxReconnectAttempts: 20, // 최대 20번 재연결 시도
    heartbeatInterval: 3000 // 3초마다 하트비트 전송
  });

  // 모빌리티 디바이스 데이터 (실제로는 API에서 가져올 것)
  const mobilityDevices: MobilityDevice[] = [
    {
      id: 'JA1732',
      name: '전기 바이크',
      type: 'BIKE',
      batteryLevel: 85,
      position: { x: 450, y: 650 },
      available: true
    },
    {
      id: 'JA1456',
      name: '전기 바이크',
      type: 'BIKE',
      batteryLevel: 72,
      position: { x: 280, y: 350 },
      available: true
    },
    {
      id: 'JA2034',
      name: '전기 킥보드',
      type: 'KICKBOARD',
      batteryLevel: 65,
      position: { x: 600, y: 400 },
      available: true
    },
    {
      id: 'JA1890',
      name: '전기 바이크',
      type: 'BIKE',
      batteryLevel: 45,
      position: { x: 700, y: 550 },
      available: false
    },
    {
      id: 'JA1566',
      name: '전기 킥보드',
      type: 'KICKBOARD',
      batteryLevel: 92,
      position: { x: 350, y: 500 },
      available: true
    }
  ];

  // ROS 연결 상태 확인
  useEffect(() => {
    if (rosError) {
      toast({
        title: "ROS 연결 오류",
        description: "ROS 브릿지 서버에 연결할 수 없습니다.",
        variant: "destructive",
      });
    }
  }, [rosError, toast]);

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // 맵 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.touches[0].clientX - startPos.x,
      y: e.touches[0].clientY - startPos.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.6));
  };

  const handleDeviceClick = (device: MobilityDevice) => {
    setSelectedDevice(device);
    setShowDeviceInfo(true);
  };

  // 찜하기 기능 처리
  const handleFavoriteDevice = () => {
    if (!selectedDevice) return;
    
    if (!isConnected) {
      toast({
        title: "ROS 연결 오류",
        description: "ROS 브릿지 서버에 연결되어 있지 않습니다. 대신 로컬 테스트로 처리합니다.",
      });
      // 연결 없이도 테스트용 토스트 표시
      toast({
        title: "테스트: 찜하기 완료",
        description: `${selectedDevice.id} 모빌리티가 찜 목록에 추가되었습니다.`,
      });
      return;
    }
    
    const success = sendFavoriteDevice(selectedDevice.id);
    
    if (success) {
      toast({
        title: "찜하기 완료",
        description: `${selectedDevice.id} 모빌리티가 찜 목록에 추가되었습니다.`,
      });
    } else {
      toast({
        title: "찜하기 실패",
        description: "ROS 토픽 발행 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 맵 헤더에 ROS 연결 테스트 버튼 추가
  const handleTestConnect = () => {
    connect();
    toast({
      title: "ROS 연결 시도",
      description: "ROS 브릿지 서버에 연결을 시도합니다."
    });
  };

  const renderBatteryIcon = (level: number) => {
    if (level > 75) return <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
    if (level > 25) return <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />;
    return <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />;
  };

  // 로딩 중이거나 인증되지 않은 경우 표시
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500">페이지 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* 헤더 */}
      <header className="bg-white shadow-sm z-50 relative">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-1 sm:mr-2 h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-semibold">바로 이용하기</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="h-7 sm:h-8 text-xs"
              onClick={handleTestConnect}
            >
              ROS 연결 테스트
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 bg-white border-gray-200"
              onClick={() => alert('정보 보기')}
            >
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 지도 영역 */}
      <div className="flex-1 relative overflow-hidden touch-none"
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* 지도 이미지 */}
        <div 
          className="absolute transition-transform"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            willChange: 'transform'
          }}
        >
          <Image 
            src="/airport.png" 
            alt="공항 지도" 
            width={1500} 
            height={1500}
            className="h-auto w-auto object-contain"
            priority
          />

          {/* 모빌리티 디바이스 마커 */}
          {mobilityDevices.map((device) => (
            <div 
              key={device.id}
              className={cn(
                "absolute p-1 sm:p-2 rounded-full transition-transform cursor-pointer",
                selectedDevice?.id === device.id ? "scale-125" : "scale-100",
                device.available ? "bg-blue-500" : "bg-gray-400"
              )}
              style={{ 
                left: `${device.position.x}px`, 
                top: `${device.position.y}px`,
                transform: `translate(-50%, -50%) scale(${selectedDevice?.id === device.id ? 1.25 : 1})`,
              }}
              onClick={() => handleDeviceClick(device)}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                {device.type === 'BIKE' ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 14l3.5 -7l4 2.5l3 -5.5" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 14h4a1 1 0 0 0 1 -1v-3a3 3 0 0 0 -3 -3h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 9l1 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 9v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1 -1v-11a1 1 0 0 0 -1 -1h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full whitespace-nowrap">
                <div className="px-1 py-0.5 sm:px-2 sm:py-1 bg-white shadow-md rounded-md text-[8px] sm:text-xs font-semibold flex items-center mt-1">
                  {renderBatteryIcon(device.batteryLevel)}
                  <span className="ml-0.5 sm:ml-1">{device.batteryLevel}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 컨트롤 패널 */}
        <div className="absolute right-3 sm:right-4 top-3 sm:top-4 flex flex-col gap-1.5 sm:gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 sm:h-10 sm:w-10 bg-white shadow-md rounded-full"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 sm:h-10 sm:w-10 bg-white shadow-md rounded-full"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 sm:h-10 sm:w-10 bg-white shadow-md rounded-full"
            onClick={() => setPosition({ x: 0, y: 0 })}
          >
            <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* ROS 연결 상태 표시 */}
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <Badge
            variant={isConnected ? "default" : "outline"}
            className={`text-[10px] sm:text-xs ${isConnected ? "bg-green-500 hover:bg-green-600" : "text-red-500 border-red-300"}`}
          >
            {isConnected ? "ROS 연결됨" : "ROS 연결 안됨"}
          </Badge>
        </div>

        {/* 하단 범례 */}
        <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4 flex gap-2 sm:gap-3 bg-white p-1.5 sm:p-2 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-[10px] sm:text-xs">이용가능</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-400 mr-1"></div>
            <span className="text-[10px] sm:text-xs">이용불가</span>
          </div>
        </div>
      </div>

      {/* 모빌리티 정보 모달 */}
      <AnimatePresence>
        {showDeviceInfo && selectedDevice && (
          <motion.div 
            className="absolute inset-x-0 bottom-0 z-50"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="relative bg-white rounded-t-xl shadow-lg p-3 sm:p-4 pb-6 sm:pb-8">
              {/* 닫기 버튼 */}
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-1 sm:right-2 top-1 sm:top-2 h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => setShowDeviceInfo(false)}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <div className="flex items-center mb-4 sm:mb-6 mt-1 sm:mt-2">
                <div className="bg-gray-100 p-2 sm:p-3 rounded-full mr-2 sm:mr-3">
                  {selectedDevice.type === 'BIKE' ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.5 14l3.5 -7l4 2.5l3 -5.5" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 14h4a1 1 0 0 0 1 -1v-3a3 3 0 0 0 -3 -3h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 9l1 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 9v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1 -1v-11a1 1 0 0 0 -1 -1h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-medium">
                      공항 모빌리티 {selectedDevice.id}
                    </h2>
                    <Badge variant={selectedDevice.available ? "default" : "outline"} className={`text-[10px] sm:text-xs font-normal ${selectedDevice.available ? "bg-blue-500 hover:bg-blue-600" : "text-gray-500"}`}>
                      {selectedDevice.available ? '이용 가능' : '이용 불가'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <Battery className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                    <span>배터리 {selectedDevice.batteryLevel}%</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                    <span>142분 이용 가능</span>
                  </div>
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button 
                  variant="outline"
                  className="py-4 sm:py-6 h-auto flex-col gap-1 sm:gap-2 border-gray-200"
                  onClick={handleFavoriteDevice}
                  disabled={!isConnected && !selectedDevice?.available}
                >
                  <span className="text-base sm:text-lg font-semibold">찜하기</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    {isConnected ? "ROS 토픽 발행" : "테스트 모드"}
                  </span>
                </Button>
                <Button 
                  className="py-4 sm:py-6 h-auto flex-col gap-1 sm:gap-2 bg-blue-500 hover:bg-blue-600"
                  onClick={() => router.push('/qr-scan')}
                >
                  <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
                  <span className="text-base sm:text-lg font-semibold">QR 스캔하기</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 