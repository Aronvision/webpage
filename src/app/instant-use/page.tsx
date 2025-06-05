'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Battery, ChevronLeft, QrCode, ZoomIn, ZoomOut, Compass, X, Info, Clock, Smartphone, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
// import { useRosConnection } from '@/hooks/use-ros-connection';

interface MobilityDevice {
  id: string;
  name: string;
  type: 'BIKE' | 'KICKBOARD';
  batteryLevel: number;
  position: { x: number; y: number }; // 이 좌표는 새 지도 이미지 크기에 맞게 조정 필요
  available: boolean;
  floor: Floor;
}

type Floor = 'B1' | '1F' | '2F' | '3F';

const floorImageMap: Record<Floor, string> = {
  'B1': '/5공학_지하.png',
  '1F': '/1공학_1층.png',
  '2F': '/5공학_1층.png',
  '3F': '/시연.png', 
};

const floorDisplayNameMap: Record<Floor, string> = {
  'B1': '지하 1층',
  '1F': '1층',
  '2F': '2층',
  '3F': '3층',
};

const BASE_MAP_WIDTH = 400*0.875;
const BASE_MAP_HEIGHT = 700*0.875;
const MOBILE_MAP_WIDTH = 400*0.875;     
const MOBILE_MAP_HEIGHT = (MOBILE_MAP_WIDTH / BASE_MAP_WIDTH) * BASE_MAP_HEIGHT; 

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
  const [currentFloor, setCurrentFloor] = useState<Floor>('1F');
  const [mapDimensions, setMapDimensions] = useState({ 
    width: BASE_MAP_WIDTH, 
    height: BASE_MAP_HEIGHT 
  });
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  

  const mobilityDevices: MobilityDevice[] = [
    {
      id: 'JA1732',
      name: '전기 바이크',
      type: 'BIKE',
      batteryLevel: 85,
      // 예시 좌표: 550x900 이미지 크기에 맞게 조정 필요
      position: { x: 50, y: 20 }, 
      available: true,
      floor: 'B1'
    },
    {
      id: 'JA1456',
      name: '전기 바이크',
      type: 'BIKE',
      batteryLevel: 72,
      position: { x: 80, y: 20 }, // 기존 550x900 기준
      available: true,
      floor: 'B1'
    },
    {
      id: 'JA2034',
      name: '전기 킥보드',
      type: 'KICKBOARD',
      batteryLevel: 65,
      position: { x: 110, y: 20 }, // 기존 550x900 기준
      available: true,
      floor: 'B1'
    },
    {
      id: 'JA1890',
      name: '전기 바이크',
      type: 'BIKE',
      batteryLevel: 45,
      position: { x: 80, y: 50 }, // 기존 550x900 기준
      available: false,
      floor: 'B1'
    },
    {
      id: 'JA1566',
      name: '전기 킥보드',
      type: 'KICKBOARD',
      batteryLevel: 92,
      position: { x: 50, y: 50 }, // 기존 550x900 기준
      available: true,
      floor: 'B1'
    },
    {
      id: 'JA2101',
      name: '1층 전기 바이크',
      type: 'BIKE',
      batteryLevel: 90,
      position: { x: 40, y: 425 }, 
      available: true,
      floor: '1F'
    },
    {
      id: 'JA2102',
      name: '1층 전기 킥보드',
      type: 'KICKBOARD',
      batteryLevel: 75,
      position: { x: 10, y: 425 }, 
      available: true,
      floor: '1F'
    },
    {
      id: 'JA2201',
      name: '2층 전기 바이크',
      type: 'BIKE',
      batteryLevel: 88,
      position: { x: 225, y: 230 }, 
      available: true,
      floor: '2F'
    },
    {
      id: 'JA2202',
      name: '2층 전기 킥보드',
      type: 'KICKBOARD',
      batteryLevel: 60,
      position: { x: 250, y: 230 }, 
      available: false,
      floor: '2F'
    },
    {
      id: 'JA3301',
      name: '3층 전기 바이크',
      type: 'BIKE',
      batteryLevel: 95,
      position: { x: 70, y: 210 }, 
      available: true,
      floor: '3F'
    },
    {
      id: 'JA3302',
      name: '3층 전기 킥보드',
      type: 'KICKBOARD',
      batteryLevel: 80,
      position: { x: 40, y: 210 }, 
      available: true,
      floor: '3F'
    },
    {
      id: 'JA3303',
      name: '3층 전기 바이크',
      type: 'BIKE',
      batteryLevel: 55,
      position: { x: 10, y: 210 }, 
      available: false,
      floor: '3F'
    }
  ];

  // 화면 크기에 따라 지도 크기 조정
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 640; // sm breakpoint
      setIsMobile(mobile);

      if (mobile) { // sm breakpoint
        setMapDimensions({ width: MOBILE_MAP_WIDTH, height: MOBILE_MAP_HEIGHT });
      } else {
        setMapDimensions({ width: BASE_MAP_WIDTH, height: BASE_MAP_HEIGHT });
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 로드 시 실행

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (status === 'unauthenticated') {
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
    // 선택된 디바이스로 지도 중앙 이동 (선택 사항)
    // const mapWidth = mapDimensions.width;
    // const mapHeight = mapDimensions.height;
    // setPosition({
    //   x: -((device.position.x / BASE_MAP_WIDTH * mapWidth) * zoom - mapWidth / (2 * zoom) ),
    //   y: -((device.position.y / BASE_MAP_HEIGHT * mapHeight) * zoom - mapHeight / (2 * zoom) )
    // });
  };

  const handleFloorChange = (floor: Floor) => {
    setCurrentFloor(floor);
    setSelectedDevice(null); // 층 변경 시 선택된 디바이스 해제
    setShowDeviceInfo(false);
    setZoom(1); // 줌 초기화
    setPosition({ x: 0, y: 0 }); // 위치 초기화
  };

  // 찜하기 기능 처리
  const handleFavoriteDevice = () => {
    if (!selectedDevice) return;
    
    // const success = sendFavoriteDevice(selectedDevice.id);
    const success = false; // 임시로 false 처리
    
    if (success) {
      toast({
        title: "찜하기 완료",
        description: `${selectedDevice.id} 모빌리티가 찜 목록에 추가되었습니다.`,
      });
    } else {
      toast({
        title: "찜하기 실패",
        description: "ROS 토픽 발행 중 오류가 발생했습니다. (또는 기능 비활성화됨)",
        variant: "destructive",
      });
    }
  };

  const renderBatteryIcon = (level: number) => {
    if (level > 75) return <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
    if (level > 25) return <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />;
    return <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
        <p className="text-neutral-500">페이지 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90 overflow-hidden sm:max-w-md sm:mx-auto">
      {/* 헤더 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm z-50 relative"
      >
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-1.5 sm:mr-2 h-9 w-9 text-slate-600 hover:bg-blue-50"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-slate-800">바로 이용하기</h1>
              <p className="text-xs text-neutral-500 hidden sm:flex items-center mt-0.5">
                현재 위치: 공학관 {floorDisplayNameMap[currentFloor]}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 층 선택 버튼 */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm py-2.5 px-2 sm:px-3 flex justify-center gap-x-2 items-center border-b border-blue-100/50">
        {(['B1', '1F', '2F', '3F'] as Floor[]).map((floor) => (
          <Button
            key={floor}
            variant={currentFloor === floor ? 'default' : 'ghost'}
            onClick={() => handleFloorChange(floor)}
            className={cn(
              "text-xs sm:text-sm px-3 py-1.5 h-auto rounded-md sm:px-4 sm:py-2",
              currentFloor === floor 
                ? "bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md"
                : "text-slate-600 hover:bg-blue-50"
            )}
          >
            {floorDisplayNameMap[floor]}
          </Button>
        ))}
      </div>

      {/* 배경 패턴 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIvPjwvZz48L3N2Zz4=')] bg-[size:24px_24px] opacity-50 pointer-events-none z-0"></div>

      {/* 메인 지도 영역 */}
      <div 
        className="flex-1 relative overflow-hidden touch-none z-10"
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
        {/* 지도 이미지 컨테이너 */}
        <div 
          className="absolute top-1/2 left-1/2 transition-transform"
          style={{ 
            width: mapDimensions.width, 
            height: mapDimensions.height,
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom}) ${isMobile ? 'translateY(-35px)' : ''}`,
            transformOrigin: 'center center', // 중앙 기준
            willChange: 'transform'
          }}
        >
          <Image 
            src={floorImageMap[currentFloor]} 
            alt={`${floorDisplayNameMap[currentFloor]} 지도`} 
            fill
            className="h-full w-full object-contain"
            priority
            key={currentFloor}
          />

          {/* 모빌리티 디바이스 마커 */}
          {mobilityDevices
            .filter(device => device.floor === currentFloor) // 현재 층에 해당하는 디바이스만 필터링
            .map((device) => {
            const markerX = (device.position.x / BASE_MAP_WIDTH) * mapDimensions.width;
            const markerY = (device.position.y / BASE_MAP_HEIGHT) * mapDimensions.height;
            return (
              <motion.div 
                key={device.id}
                className={cn(
                  "absolute p-1 sm:p-1.5 rounded-full cursor-pointer", 
                  device.available ? "bg-blue-500" : "bg-gray-400"
                )}
                style={{ 
                  left: `${markerX}px`, 
                  top: `${markerY}px`,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: selectedDevice?.id === device.id ? 1.20 : 1, 
                  opacity: 1 
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => handleDeviceClick(device)}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  {device.type === 'BIKE' ? (
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.5 14l3.5 -7l4 2.5l3 -5.5" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 14h4a1 1 0 0 0 1 -1v-3a3 3 0 0 0 -3 -3h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 9l1 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 9v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1 -1v-11a1 1 0 0 0 -1 -1h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[90%] whitespace-nowrap">
                  <div className="px-1 py-0.5 bg-white shadow-md rounded-md text-[7px] sm:text-[10px] font-semibold flex items-center mt-0.5">
                    {renderBatteryIcon(device.batteryLevel)}
                    <span className="ml-0.5">{device.batteryLevel}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 컨트롤 패널 */}
        <div className="absolute right-2 sm:right-3 top-2 sm:top-3 flex flex-col gap-1 sm:gap-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8 bg-white shadow-md rounded-full hover:bg-blue-50 border-blue-200"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8 bg-white shadow-md rounded-full hover:bg-blue-50 border-blue-200"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 sm:h-8 sm:w-8 bg-white shadow-md rounded-full hover:bg-blue-50 border-blue-200"
            onClick={() => { setPosition({ x: 0, y: 0 }); setZoom(1);}}
          >
            <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* 하단 범례 */}
        <div className="absolute left-2 sm:left-3 bottom-2 sm:bottom-3 flex gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-sm p-1 sm:p-1.5 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 mr-0.5 sm:mr-1"></div>
            <span className="text-[8px] sm:text-[10px]">이용가능</span>
          </div>
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400 mr-0.5 sm:mr-1"></div>
            <span className="text-[8px] sm:text-[10px]">이용불가</span>
          </div>
        </div>
      </div>

      {/* 모빌리티 정보 모달 */}
      <AnimatePresence>
        {showDeviceInfo && selectedDevice && (
          <motion.div 
            className="absolute inset-x-0 bottom-0 z-50 sm:max-w-md sm:mx-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="relative bg-white/95 backdrop-blur-sm rounded-t-xl shadow-lg p-3 sm:p-4 pb-5 sm:pb-6 border-t border-x border-blue-100/50">
              {/* 닫기 버튼 */}
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-1 sm:right-2 top-1 sm:top-2 h-6 w-6 sm:h-7 sm:w-7 hover:bg-blue-50"
                onClick={() => setShowDeviceInfo(false)}
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>

              <div className="flex items-center mb-3 sm:mb-4 mt-1">
                <div className="bg-blue-50 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-2.5">
                  {selectedDevice.type === 'BIKE' ? (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" strokeWidth="2" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.5 14l3.5 -7l4 2.5l3 -5.5" strokeWidth="2" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" strokeWidth="2" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 14h4a1 1 0 0 0 1 -1v-3a3 3 0 0 0 -3 -3h-1" strokeWidth="2" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 9l1 0" strokeWidth="2" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 9v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1 -1v-11a1 1 0 0 0 -1 -1h-1" strokeWidth="2" stroke="#3b82f6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-sm sm:text-base font-medium">
                      모빌리티 {selectedDevice.id}
                    </h2>
                    <Badge variant={selectedDevice.available ? "default" : "outline"} className={`text-[9px] sm:text-[10px] font-normal px-1.5 py-0.5 ${selectedDevice.available ? "bg-blue-500 hover:bg-blue-600" : "text-gray-500"}`}>
                      {selectedDevice.available ? '이용 가능' : '이용 불가'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mt-0.5">
                    <Battery className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                    <span>배터리 {selectedDevice.batteryLevel}%</span>
                    <span className="mx-1 sm:mx-1.5">•</span>
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5" />
                    <span>142분 이용 가능</span>
                  </div>
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="w-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="py-3 sm:py-4 h-auto flex-col gap-1 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 shadow-md w-full"
                    onClick={() => router.push('/qr-scan')}
                  >
                    <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4 mb-0.5" />
                    <span className="font-semibold">QR 스캔</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 