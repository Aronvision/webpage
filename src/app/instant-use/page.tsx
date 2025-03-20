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

  const renderBatteryIcon = (level: number) => {
    if (level > 75) return <Battery className="w-4 h-4 text-green-500" />;
    if (level > 25) return <Battery className="w-4 h-4 text-amber-500" />;
    return <Battery className="w-4 h-4 text-red-500" />;
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
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="mr-2"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">바로 이용하기</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8 bg-white border-gray-200"
              onClick={() => alert('정보 보기')}
            >
              <Info className="h-4 w-4" />
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
                "absolute p-2 rounded-full transition-transform cursor-pointer",
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
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                {device.type === 'BIKE' ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.5 14l3.5 -7l4 2.5l3 -5.5" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 14h4a1 1 0 0 0 1 -1v-3a3 3 0 0 0 -3 -3h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 9l1 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 9v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1 -1v-11a1 1 0 0 0 -1 -1h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full whitespace-nowrap">
                <div className="px-2 py-1 bg-white shadow-md rounded-md text-xs font-semibold flex items-center mt-1">
                  {renderBatteryIcon(device.batteryLevel)}
                  <span className="ml-1">{device.batteryLevel}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 컨트롤 패널 */}
        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 bg-white shadow-md rounded-full"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 bg-white shadow-md rounded-full"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 bg-white shadow-md rounded-full"
            onClick={() => setPosition({ x: 0, y: 0 })}
          >
            <Compass className="h-5 w-5" />
          </Button>
        </div>

        {/* 하단 범례 */}
        <div className="absolute left-4 bottom-4 flex gap-3 bg-white p-2 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-xs">이용가능</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
            <span className="text-xs">이용불가</span>
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
            <div className="relative bg-white rounded-t-xl shadow-lg p-4 pb-8">
              {/* 닫기 버튼 */}
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setShowDeviceInfo(false)}
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="flex items-center mb-6 mt-2">
                <div className="bg-gray-100 p-3 rounded-full mr-3">
                  {selectedDevice.type === 'BIKE' ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.5 14l3.5 -7l4 2.5l3 -5.5" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 14h4a1 1 0 0 0 1 -1v-3a3 3 0 0 0 -3 -3h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 9l1 0" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 9v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1 -1v-11a1 1 0 0 0 -1 -1h-1" strokeWidth="2" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium">
                      공항 모빌리티 {selectedDevice.id}
                    </h2>
                    <Badge variant={selectedDevice.available ? "default" : "outline"} className={`font-normal ${selectedDevice.available ? "bg-blue-500 hover:bg-blue-600" : "text-gray-500"}`}>
                      {selectedDevice.available ? '이용 가능' : '이용 불가'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Battery className="w-4 h-4 mr-1" />
                    <span>배터리 {selectedDevice.batteryLevel}%</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>142분 이용 가능</span>
                  </div>
                </div>
              </div>

              {/* 버튼 그룹 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Button 
                  variant="outline"
                  className="py-6 h-auto flex-col gap-2 border-gray-200"
                  onClick={() => alert('찜하기 기능 준비 중입니다.')}
                >
                  <span className="text-lg font-semibold">찜하기</span>
                  <span className="text-xs text-gray-500">BETA</span>
                </Button>
                <Button 
                  className="py-6 h-auto flex-col gap-2 bg-blue-500 hover:bg-blue-600"
                  onClick={() => router.push('/qr-scan')}
                >
                  <QrCode className="h-5 w-5 mb-1" />
                  <span className="text-lg font-semibold">QR 스캔하기</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 