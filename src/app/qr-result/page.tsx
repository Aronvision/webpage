"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, ChevronLeft, Coffee, Utensils, ShoppingBag, Heart, Wifi, Phone, Baby, AccessibilityIcon, Plane, ZoomIn, ZoomOut, Move, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFacilities } from '@/features/facilities/hooks/useFacilities';
import { facilityCategories, terminals, floors } from '@/features/facilities/constants';
import { categoryInfo } from '@/features/facilities/types';
import { Facility } from '@/features/facilities/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// 지도 크기 상수 정의
const BASE_MAP_WIDTH = 1512;
const BASE_MAP_HEIGHT = 1008;
const MOBILE_MAP_WIDTH = 490;
const MOBILE_MAP_HEIGHT = (MOBILE_MAP_WIDTH / BASE_MAP_WIDTH) * BASE_MAP_HEIGHT;

// 필터링된 터미널 및 층 데이터
const filteredTerminals = terminals.filter(terminal => terminal.id !== 'T2');
const filteredFloors = floors.filter(floor => !['4F', 'ALL'].includes(floor.id));

// React Query 클라이언트 생성
const queryClient = new QueryClient();

// 지도 페이지 래퍼 컴포넌트
export default function MapPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <MapPage />
    </QueryClientProvider>
  );
}

// 지도 페이지 컴포넌트
function MapPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { dismiss } = useToast();
  const [selectedTerminal, setSelectedTerminal] = useState('T1');
  const [selectedFloor, setSelectedFloor] = useState('3F');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isInitialMount = useRef(true);
  
  // 지도 확대/축소 및 이동을 위한 상태
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const constraintsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mapDimensions, setMapDimensions] = useState({ 
    width: BASE_MAP_WIDTH, 
    height: BASE_MAP_HEIGHT 
  });

  // 편의시설 데이터 가져오기
  const {
    facilities,
    isLoading,
    isError,
    filter,
    updateFilter,
  } = useFacilities();

  // 화면 크기에 따라 지도 크기 조정
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);

      if (mobile) {
        setMapDimensions({ width: MOBILE_MAP_WIDTH, height: MOBILE_MAP_HEIGHT });
      } else {
        setMapDimensions({ width: BASE_MAP_WIDTH, height: BASE_MAP_HEIGHT });
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 로드 시 실행

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 필터 변경 시 API 호출 - 초기 마운트 시에만 실행하고, 이후에는 개별 필터 변경 시에만 실행
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      updateFilter({
        terminal: selectedTerminal,
        floor: selectedFloor,
        category: selectedCategory as any,
        searchQuery
      });
    }
  }, [updateFilter]);

  // 터미널 변경 시
  useEffect(() => {
    if (!isInitialMount.current) {
      updateFilter({ terminal: selectedTerminal });
    }
  }, [selectedTerminal, updateFilter]);

  // 층 변경 시
  useEffect(() => {
    if (!isInitialMount.current) {
      updateFilter({ floor: selectedFloor });
    }
  }, [selectedFloor, updateFilter]);

  // 카테고리 변경 시
  useEffect(() => {
    if (!isInitialMount.current) {
      updateFilter({ category: selectedCategory as any });
    }
  }, [selectedCategory, updateFilter]);

  // 검색어 변경 시 - 디바운스 적용
  useEffect(() => {
    if (!isInitialMount.current) {
      const timer = setTimeout(() => {
        updateFilter({ searchQuery });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, updateFilter]);

  // 핀치 줌 이벤트 처리
  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        initialDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const ratio = currentDistance / initialDistance;
        const newScale = Math.max(0.5, Math.min(initialScale * ratio, 3));
        
        setScale(newScale);
        
        // 이벤트 전파 방지
        e.preventDefault();
      }
    };

    mapElement.addEventListener('touchstart', handleTouchStart);
    mapElement.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      mapElement.removeEventListener('touchstart', handleTouchStart);
      mapElement.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scale]);

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

  // 마커 클릭 핸들러
  const handleMarkerClick = (facility: Facility) => {
    router.push(`/facilities/${facility.id}`);
  };

  // 아이콘 렌더링 함수
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'map-pin': return <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'utensils': return <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'coffee': return <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'shopping-bag': return <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'heart': return <Heart className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'wifi': return <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'phone': return <Phone className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'baby': return <Baby className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'accessibility': return <AccessibilityIcon className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'plane': return <Plane className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  // 확대/축소 핸들러
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 드래그 핸들러
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90 sm:max-w-4xl sm:mx-auto">
      {/* 헤더 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-2 p-2 text-slate-600 hover:bg-blue-50"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">목적지 선택</h1>
          </div>
        </div>
      </motion.div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* 왼쪽 사이드바 - 검색 및 필터 (모바일에서는 상단) */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardContent className="p-3 sm:p-4">
                {/* 검색 */}
                <div className="mb-4 sm:mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <Input 
                      placeholder="시설 검색" 
                      className="pl-10 bg-white border-neutral-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* 터미널 선택 */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-medium text-neutral-500 mb-2">터미널</h3>
                  <div className="flex space-x-2">
                    {filteredTerminals.map(terminal => (
                      <Button
                        key={terminal.id}
                        variant={selectedTerminal === terminal.id ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          selectedTerminal === terminal.id 
                            ? "bg-primary-500 text-white" 
                            : "border-neutral-200 text-neutral-700",
                          "text-xs sm:text-sm h-8 sm:h-10"
                        )}
                        onClick={() => setSelectedTerminal(terminal.id)}
                      >
                        {terminal.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 층 선택 */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-medium text-neutral-500 mb-2">층</h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredFloors.map(floor => (
                      <Button
                        key={floor.id}
                        variant={selectedFloor === floor.id ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          selectedFloor === floor.id 
                            ? "bg-primary-500 text-white" 
                            : "border-neutral-200 text-neutral-700",
                          "text-xs sm:text-sm h-8 sm:h-10 px-2.5 sm:px-3"
                        )}
                        onClick={() => setSelectedFloor(floor.id)}
                      >
                        {floor.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 카테고리 선택 */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xs sm:text-sm font-medium text-neutral-500 mb-2">편의시설</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {facilityCategories.map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          selectedCategory === category.id 
                            ? "bg-primary-500 text-white" 
                            : "border-neutral-200 text-neutral-700",
                          "justify-start text-xs sm:text-sm h-8 sm:h-10"
                        )}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="mr-1.5 sm:mr-2">{renderIcon(category.icon)}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 검색 결과 */}
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-neutral-500 mb-2">
                    {isLoading ? '로딩 중...' : `검색 결과 (${facilities.length})`}
                  </h3>
                  <div className="max-h-40 sm:max-h-60 overflow-y-auto pr-2 space-y-2">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : isError ? (
                      <p className="text-red-500 text-xs sm:text-sm text-center py-3 sm:py-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
                    ) : facilities.length > 0 ? (
                      facilities.map(facility => (
                        <motion.div
                          key={facility.id}
                          whileHover={{ x: 3 }}
                          className="p-2 sm:p-3 rounded-lg cursor-pointer border bg-white border-neutral-200 hover:border-primary-200"
                          onClick={() => handleMarkerClick(facility)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-neutral-800 text-xs sm:text-sm">{facility.name}</p>
                              <p className="text-xs text-neutral-500">{facility.location}</p>
                            </div>
                            {renderIcon(facilityCategories.find(cat => cat.id === facility.category)?.icon || 'map-pin')}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-neutral-500 text-xs sm:text-sm text-center py-3 sm:py-4">검색 결과가 없습니다</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 오른쪽 - 지도 */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100 overflow-hidden">
              <CardContent className="p-0">
                {/* 지도 컨트롤 */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 flex flex-col space-y-1.5 sm:space-y-2">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-white/90 shadow-md hover:bg-white h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-white/90 shadow-md hover:bg-white h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-white/90 shadow-md hover:bg-white h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    onClick={handleReset}
                  >
                    <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                {/* 확대/축소 인디케이터 */}
                <div className="absolute bottom-5 sm:bottom-20 right-3 sm:right-4 z-40 bg-white/90 shadow-md rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-neutral-600">
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-neutral-200 rounded-full">
                      <div 
                        className="h-full bg-primary-500 rounded-full transition-all duration-300"
                        style={{ width: `${((scale - 0.5) / 2.5) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium text-xs">{Math.round(scale * 100)}%</span>
                  </div>
                </div>

                {/* 모바일 사용 안내 */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40 md:hidden">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-white/90 shadow-md rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-neutral-600 max-w-[180px] sm:max-w-[200px]"
                  >
                    <p>두 손가락으로 확대/축소하고 드래그하여 이동할 수 있습니다.</p>
                  </motion.div>
                </div>

                {/* 지도 컨테이너 */}
                <div 
                  ref={constraintsRef}
                  className="relative w-full h-[60vh] sm:h-[70vh] bg-neutral-100 overflow-hidden touch-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  {/* 지도 영역 */}
                  <div 
                    ref={mapRef}
                    className="relative w-full h-full"
                  >
                    {/* 확대/축소 및 이동 가능한 지도 */}
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ 
                        width: mapDimensions.width, 
                        height: mapDimensions.height,
                        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center center',
                        willChange: 'transform'
                      }}
                    >
                      {/* 지도 이미지 */}
                      <Image
                        src={
                          selectedFloor === 'B1' ? "/5공학_지하.png" :
                          selectedFloor === '1F' ? "/1공학_1층.png" :
                          selectedFloor === '2F' ? "/5공학_1층.png" :
                          selectedFloor === '3F' ? "/시연.png" :
                          "/airport.png"
                        }
                        alt="공항 지도"
                        fill
                        className="object-contain"
                        style={selectedFloor === '3F' ? { transform: 'scale(0.6)' } : {}}
                        draggable={false}
                      />

                      {/* 마커 표시 */}
                      {!isLoading && !isError && facilities.map(facility => (
                        <motion.div
                          key={facility.id}
                          className="absolute cursor-pointer"
                          style={{ 
                            left: `${facility.coordinates.x}%`, 
                            top: `${facility.coordinates.y}%` 
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          onClick={() => handleMarkerClick(facility)}
                        >
                          <div className="p-1.5 sm:p-2 rounded-full bg-white text-primary-500 border border-primary-300 shadow-md">
                            {renderIcon(facilityCategories.find(cat => cat.id === facility.category)?.icon || 'map-pin')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 