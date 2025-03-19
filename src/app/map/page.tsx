'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, ChevronLeft, Coffee, Utensils, ShoppingBag, Heart, Wifi, Phone, Baby, AccessibilityIcon, Plane, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFacilities } from '@/features/facilities/hooks/useFacilities';
import { facilityCategories, terminals, floors } from '@/features/facilities/constants';
import { categoryInfo } from '@/features/facilities/types';
import { Facility } from '@/features/facilities/types';

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
  const [selectedTerminal, setSelectedTerminal] = useState('T1');
  const [selectedFloor, setSelectedFloor] = useState('1F');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isInitialMount = useRef(true);
  
  // 지도 확대/축소 및 이동을 위한 상태
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const constraintsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // 편의시설 데이터 가져오기
  const {
    facilities,
    isLoading,
    isError,
    filter,
    updateFilter,
    selectedFacility,
    selectFacility
  } = useFacilities();

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
    selectFacility(facility);
  };

  // 아이콘 렌더링 함수
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'map-pin': return <MapPin className="w-4 h-4" />;
      case 'utensils': return <Utensils className="w-4 h-4" />;
      case 'coffee': return <Coffee className="w-4 h-4" />;
      case 'shopping-bag': return <ShoppingBag className="w-4 h-4" />;
      case 'heart': return <Heart className="w-4 h-4" />;
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'baby': return <Baby className="w-4 h-4" />;
      case 'accessibility': return <AccessibilityIcon className="w-4 h-4" />;
      case 'plane': return <Plane className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
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
  const onDragEnd = (event: any, info: any) => {
    setPosition({
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    });
  };

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
            <h1 className="text-2xl font-bold text-neutral-900">공항 지도</h1>
          </div>
        </div>
      </motion.div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽 사이드바 - 검색 및 필터 */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardContent className="p-4">
                {/* 검색 */}
                <div className="mb-6">
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
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">터미널</h3>
                  <div className="flex space-x-2">
                    {terminals.map(terminal => (
                      <Button
                        key={terminal.id}
                        variant={selectedTerminal === terminal.id ? "default" : "outline"}
                        className={selectedTerminal === terminal.id 
                          ? "bg-primary-500 text-white" 
                          : "border-neutral-200 text-neutral-700"}
                        onClick={() => setSelectedTerminal(terminal.id)}
                      >
                        {terminal.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 층 선택 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">층</h3>
                  <div className="flex flex-wrap gap-2">
                    {floors.map(floor => (
                      <Button
                        key={floor.id}
                        variant={selectedFloor === floor.id ? "default" : "outline"}
                        className={`${selectedFloor === floor.id 
                          ? "bg-primary-500 text-white" 
                          : "border-neutral-200 text-neutral-700"} px-3`}
                        onClick={() => setSelectedFloor(floor.id)}
                      >
                        {floor.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 카테고리 선택 */}
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">편의시설</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {facilityCategories.map(category => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className={`${selectedCategory === category.id 
                          ? "bg-primary-500 text-white" 
                          : "border-neutral-200 text-neutral-700"} justify-start`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span className="mr-2">{renderIcon(category.icon)}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 검색 결과 */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-neutral-500 mb-2">
                    {isLoading ? '로딩 중...' : `검색 결과 (${facilities.length})`}
                  </h3>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : isError ? (
                      <p className="text-red-500 text-center py-4">데이터를 불러오는 중 오류가 발생했습니다.</p>
                    ) : facilities.length > 0 ? (
                      facilities.map(facility => (
                        <motion.div
                          key={facility.id}
                          whileHover={{ x: 3 }}
                          className={`p-3 rounded-lg cursor-pointer border ${
                            selectedFacility?.id === facility.id 
                              ? 'bg-primary-50 border-primary-200' 
                              : 'bg-white border-neutral-200 hover:border-primary-200'
                          }`}
                          onClick={() => handleMarkerClick(facility)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-neutral-800">{facility.name}</p>
                              <p className="text-sm text-neutral-500">{facility.location}</p>
                            </div>
                            {renderIcon(facilityCategories.find(cat => cat.id === facility.category)?.icon || 'map-pin')}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-neutral-500 text-center py-4">검색 결과가 없습니다</p>
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
                <div className="absolute top-4 right-4 z-40 flex flex-col space-y-2">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-white/90 shadow-md hover:bg-white"
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-white/90 shadow-md hover:bg-white"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="bg-white/90 shadow-md hover:bg-white"
                    onClick={handleReset}
                  >
                    <Move className="w-5 h-5" />
                  </Button>
                </div>

                {/* 확대/축소 인디케이터 */}
                <div className="absolute bottom-20 right-4 z-40 bg-white/90 shadow-md rounded-lg px-3 py-2 text-sm text-neutral-600">
                  <div className="flex items-center space-x-2">
                    <ZoomIn className="w-4 h-4" />
                    <div className="w-24 h-1.5 bg-neutral-200 rounded-full">
                      <div 
                        className="h-full bg-primary-500 rounded-full transition-all duration-300"
                        style={{ width: `${((scale - 0.5) / 2.5) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium">{Math.round(scale * 100)}%</span>
                  </div>
                </div>

                {/* 모바일 사용 안내 */}
                <div className="absolute top-4 left-4 z-40 md:hidden">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-white/90 shadow-md rounded-lg px-3 py-2 text-sm text-neutral-600 max-w-[200px]"
                  >
                    <p>두 손가락으로 확대/축소하고 드래그하여 이동할 수 있습니다.</p>
                  </motion.div>
                </div>

                {/* 지도 컨테이너 */}
                <div 
                  ref={constraintsRef}
                  className="relative w-full h-[calc(100vh-20rem)] bg-neutral-100 overflow-hidden touch-none"
                >
                  {/* 확대/축소 및 이동 가능한 지도 */}
                  <motion.div
                    ref={mapRef}
                    className="relative w-full h-full origin-center"
                    style={{ scale }}
                    drag
                    dragConstraints={constraintsRef}
                    onDragEnd={onDragEnd}
                    dragElastic={0.1}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                  >
                    {/* 지도 이미지 */}
                    <Image
                      src="/airport.png"
                      alt="공항 지도"
                      fill
                      className="object-contain"
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
                        <div className={`p-1 rounded-full ${
                          selectedFacility?.id === facility.id 
                            ? 'bg-primary-500 text-white ring-4 ring-primary-200 z-20' 
                            : 'bg-white text-primary-500 border border-primary-300 z-10'
                        }`}>
                          {renderIcon(facilityCategories.find(cat => cat.id === facility.category)?.icon || 'map-pin')}
                        </div>
                        {selectedFacility?.id === facility.id && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white shadow-lg rounded-lg p-2 z-30 whitespace-nowrap">
                            <p className="font-medium text-sm">{facility.name}</p>
                            <p className="text-xs text-neutral-500">{facility.location}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* 선택된 시설 정보 */}
                  {selectedFacility && (
                    <motion.div
                      className="absolute bottom-4 left-4 right-4 bg-white shadow-lg rounded-lg p-4 z-30"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-bold text-neutral-800">{selectedFacility.name}</h3>
                            <Badge className={`ml-2 ${categoryInfo[selectedFacility.category]?.color || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {facilityCategories.find(cat => cat.id === selectedFacility.category)?.name || '기타'}
                            </Badge>
                          </div>
                          <p className="text-neutral-500">{selectedFacility.location}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-primary-200 text-primary-700"
                          onClick={() => router.push(`/facilities/${selectedFacility.id}`)}
                        >
                          상세 정보
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}