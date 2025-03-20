'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

// 애니메이션 변수
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const slideIn = {
  hidden: { x: 60, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// 캐러셀 아이템 데이터
const testimonials = [
  {
    id: 1,
    name: '김지민',
    image: 'https://picsum.photos/200/200?11',
    rating: 5,
    text: 'NUVI 서비스를 이용해보니 정말 편리했습니다. 빠른 이동과 정확한 안내로 공항에서의 시간을 절약할 수 있었습니다.'
  },
  {
    id: 2,
    name: '이서준',
    image: 'https://picsum.photos/200/200?12',
    rating: 5,
    text: '처음에는 로봇이 안내해준다는 것이 낯설었지만, 실제로 이용해보니 매우 직관적이고 안전했습니다. 다음에도 꼭 이용할 예정입니다.'
  },
  {
    id: 3,
    name: '박민지',
    image: 'https://picsum.photos/200/200?13',
    rating: 4,
    text: '아이와 함께 여행할 때 짐이 많아 걱정했는데, NUVI 덕분에 편하게 이동할 수 있었습니다. 정말 감사합니다!'
  },
  {
    id: 4,
    name: '최준호',
    image: 'https://picsum.photos/200/200?14',
    rating: 5,
    text: '비즈니스 출장이 잦은데, 이 서비스 덕분에 공항에서의 이동이 훨씬 효율적이 되었습니다. 특히 실시간 위치 추적 기능이 유용했습니다.'
  },
  {
    id: 5,
    name: '정수아',
    image: 'https://picsum.photos/200/200?15',
    rating: 5,
    text: '외국인으로서 한국 공항을 처음 방문했는데, NUVI가 있어 길을 잃지 않고 목적지까지 쉽게 찾아갈 수 있었습니다.'
  }
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(0);
  const testimonialIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session, status } = useSession();
  
  useEffect(() => {
    setIsLoaded(true);
    
    // 자동 슬라이드 설정
    testimonialIntervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => {
      if (testimonialIntervalRef.current) {
        clearInterval(testimonialIntervalRef.current);
      }
    };
  }, []);
  
  const handlePrev = () => {
    if (testimonialIntervalRef.current) {
      clearInterval(testimonialIntervalRef.current);
    }
    setDirection(-1);
    setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    
    // 자동 슬라이드 재설정
    testimonialIntervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
  };
  
  const handleNext = () => {
    if (testimonialIntervalRef.current) {
      clearInterval(testimonialIntervalRef.current);
    }
    setDirection(1);
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    
    // 자동 슬라이드 재설정
    testimonialIntervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
  };
  
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-primary-100">
      {/* Header */}
      <Header isLoggedIn={!!session} />

      {/* Hero Section */}
      <main className="flex-1">
        {/* Hero Container */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            {/* Left Content */}
            <motion.div 
              className="flex-1 flex flex-col w-full"
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              variants={fadeIn}
            >
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500"
                variants={fadeIn}
              >
                NUVI와 함께,<br />
                안전하고 빠른 이동을 누려보세요.
              </motion.h1>
              
              <motion.p 
                className="text-base md:text-lg text-neutral-700 mb-6 md:mb-8 max-w-xl"
                variants={fadeIn}
              >
                공항 내 이동이 필요하신가요? NUVI 서비스를 통해 편리하게 목적지까지 안내받으세요.
                간편한 예약과 실시간 위치 추적으로 더 나은 공항 경험을 제공합니다.
              </motion.p>
              
              {/* Stats Section */}
              <motion.div 
                className="grid grid-cols-3 gap-2 sm:gap-6 mb-8 md:mb-12"
                variants={staggerContainer}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
              >
                <motion.div variants={scaleIn} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary-700">98%</p>
                  <p className="text-xs md:text-sm text-neutral-600">고객 만족도</p>
                </motion.div>
                <motion.div variants={scaleIn} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary-700">5분</p>
                  <p className="text-xs md:text-sm text-neutral-600">평균 대기 시간</p>
                </motion.div>
                <motion.div variants={scaleIn} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary-700">24/7</p>
                  <p className="text-xs md:text-sm text-neutral-600">서비스 운영</p>
                </motion.div>
              </motion.div>
              
              {/* Feature Cards */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate={isLoaded ? "visible" : "hidden"}
              >
                <motion.div variants={scaleIn}>
                  <Card className="p-4 md:p-6 bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                    <div className="mb-3 md:mb-4 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-base md:text-lg mb-2">빠른 예약</h3>
                    <p className="text-xs md:text-sm text-neutral-700">몇 번의 클릭만으로 공항 내 이동 서비스를 예약하세요. 간편한 UI로 누구나 쉽게 이용할 수 있습니다.</p>
                  </Card>
                </motion.div>
                
                <motion.div variants={scaleIn}>
                  <Card className="p-4 md:p-6 bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                    <div className="mb-3 md:mb-4 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-base md:text-lg mb-2">실시간 추적</h3>
                    <p className="text-xs md:text-sm text-neutral-700">모빌리티 로봇의 현재 위치를 실시간으로 확인하세요. 언제 도착할지 정확히 알 수 있습니다.</p>
                  </Card>
                </motion.div>
                
                <motion.div variants={scaleIn}>
                  <Card className="p-4 md:p-6 bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                    <div className="mb-3 md:mb-4 text-primary-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-base md:text-lg mb-2">안전한 이동</h3>
                    <p className="text-xs md:text-sm text-neutral-700">최적화된 경로로 안전하게 목적지까지 안내해 드립니다. 장애물 감지 시스템으로 안전을 보장합니다.</p>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Right Image */}
            <motion.div 
              className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl h-[300px] sm:h-[400px] md:h-[500px] w-full mt-6 lg:mt-0"
              initial={{ opacity: 0, x: 100 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative w-full h-full">
                <Image
                  src="https://picsum.photos/1200/600?1"
                  alt="NUVI 서비스 이미지"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent"></div>
              
              {/* Floating Card */}
              <motion.div 
                className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8 bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">지금 바로 시작하세요</h3>
                <p className="text-xs md:text-sm text-neutral-700 mb-2 md:mb-4">NUVI 서비스로 더 편리한 공항 경험을 만나보세요.</p>
                <Button asChild size="sm" className="bg-primary-500 hover:bg-primary-700 text-white rounded-full">
                  <Link href="/signup">무료로 시작하기</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Testimonials Section - Carousel */}
        <motion.div 
          className="bg-neutral-100 py-10 md:py-16"
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">고객 후기</h2>
            
            {/* Carousel Container */}
            <div className="relative max-w-4xl mx-auto px-10 md:px-0">
              {/* Carousel Navigation */}
              <div className="absolute top-1/2 left-0 md:-left-12 -translate-y-1/2 z-10">
                <button 
                  onClick={handlePrev}
                  className="bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-primary-100 transition-colors duration-200"
                  aria-label="이전 후기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              </div>
              
              <div className="absolute top-1/2 right-0 md:-right-12 -translate-y-1/2 z-10">
                <button 
                  onClick={handleNext}
                  className="bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-primary-100 transition-colors duration-200"
                  aria-label="다음 후기"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
              
              {/* Carousel Slides */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="relative h-[250px] sm:h-[300px]">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={currentTestimonial}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col items-center"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 md:mb-4 border-4 border-primary-100">
                        <Image 
                          src={testimonials[currentTestimonial].image} 
                          alt={`${testimonials[currentTestimonial].name} 이미지`} 
                          width={80} 
                          height={80}
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex text-secondary-500 mb-3 md:mb-4">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, j) => (
                          <svg key={j} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mx-1">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-neutral-700 text-center text-sm md:text-base lg:text-lg mb-3 md:mb-4 italic line-clamp-3 md:line-clamp-none">
                        "{testimonials[currentTestimonial].text}"
                      </p>
                      
                      <h4 className="font-semibold text-lg md:text-xl text-primary-700">
                        {testimonials[currentTestimonial].name}
                      </h4>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex justify-center mt-6 md:mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentTestimonial ? 1 : -1);
                      setCurrentTestimonial(index);
                    }}
                    className={`mx-1 w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-primary-500 w-4 md:w-6' : 'bg-neutral-300'
                    }`}
                    aria-label={`${index + 1}번 후기로 이동`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Banner Section */}
        <motion.div 
          className="py-8 md:py-12 bg-gradient-to-r from-primary-700 to-primary-500"
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                    실시간 예약 서비스
                  </h2>
                  <p className="text-white/90 mb-4 max-w-lg text-xs sm:text-sm md:text-base">
                    웹사이트에서 바로 예약하고 실시간으로 NUVI 로봇의 위치를 확인하세요. 공항 내 어디서든 편리하게 서비스를 이용할 수 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <Button asChild size="sm" className="bg-white text-primary-700 hover:bg-neutral-100 rounded-full text-xs sm:text-sm">
                      <Link href="/reservation" className="flex items-center gap-1 md:gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                        예약하기
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-white text-primary-700 hover:bg-neutral-100 rounded-full text-xs sm:text-sm">
                      <Link href="/tracking" className="flex items-center gap-1 md:gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        위치 추적
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="md:w-1/2 flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                <div className="relative w-[250px] sm:w-[300px] h-[160px] sm:h-[200px]">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border-4 border-white/20">
                    <div className="relative w-full h-full">
                      <Image
                        src="https://picsum.photos/800/500?30"
                        alt="NUVI 실시간 위치 추적 화면"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Divider */}
        <div className="h-12 md:h-16 bg-gradient-to-b from-primary-500 to-primary-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
        </div>
        
        {/* CTA Section */}
        <motion.div 
          className="bg-primary-800 text-white py-10 md:py-16 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {/* 배경 장식 요소 */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 sm:w-64 h-32 sm:h-64 rounded-full bg-primary-700/30 blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 sm:w-80 h-40 sm:h-80 rounded-full bg-primary-900/30 blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="bg-primary-900/60 backdrop-blur-sm py-6 sm:py-8 md:py-10 px-4 sm:px-6 rounded-xl shadow-xl border border-white/10"
            >
              <div className="flex flex-col md:flex-row items-center justify-between max-w-none">
                <div className="md:w-1/2 mb-6 md:mb-0 text-left md:pr-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-white drop-shadow-md">지금 바로 시작하세요</h2>
                  <p className="text-white font-medium text-sm md:text-base">
                    NUVI 서비스로 더 편리하고 안전한 공항 경험을 만나보세요. 
                    지금 가입하면 첫 이용 시 특별 혜택을 드립니다.
                  </p>
                </div>
                <div className="md:w-auto flex justify-center">
                  <Button asChild size="lg" className="bg-white hover:bg-neutral-100 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 sm:px-8 font-semibold text-sm md:text-base">
                    <Link href="/signup" className="flex items-center gap-2 text-neutral-900">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-900">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                      무료로 시작하기
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
