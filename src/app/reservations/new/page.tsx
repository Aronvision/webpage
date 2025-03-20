'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

export default function ReservationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // 예약 폼 상태
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [time, setTime] = useState<string>('10:00');
  const [terminal, setTerminal] = useState<string>('terminal1');
  const [destination, setDestination] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 시간 옵션 생성 (30분 간격)
  const timeOptions = [];
  for (let hour = 6; hour < 23; hour++) {
    for (let minute of ['00', '30']) {
      timeOptions.push(`${hour.toString().padStart(2, '0')}:${minute}`);
    }
  }

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

  // 예약 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !terminal || !destination) {
      toast.error('필수 정보를 입력해주세요', {
        description: '날짜, 시간, 터미널, 목적지는 필수 입력 항목입니다.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 여기에 실제 API 호출 코드가 들어갈 예정
      await new Promise(resolve => setTimeout(resolve, 1500)); // 임시 지연
      
      toast.success('예약이 완료되었습니다', {
        description: `${format(date, 'PPP', { locale: ko })} ${time}에 예약이 확정되었습니다.`
      });
      
      // 예약 완료 후 대시보드로 이동
      router.push('/dashboard');
    } catch (error) {
      toast.error('예약 중 오류가 발생했습니다', {
        description: '잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
      {/* 헤더 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-sm border-b border-blue-100/50 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="mr-3 md:mr-4 text-neutral-600 hover:text-primary-600"
              onClick={() => router.back()}
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1" />
              뒤로
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">새 예약 만들기</h1>
          </div>
        </div>
      </motion.div>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 relative">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIvPjwvZz48L3N2Zz4=')] bg-[size:24px_24px] opacity-50 pointer-events-none"></div>
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 예약 폼 */}
          <motion.div variants={itemVariants}>
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-lg sm:text-xl flex items-center">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-500" />
                  예약 정보 입력
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  모빌리티 로봇 예약을 위한 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* 날짜 선택 */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="date" className="text-sm sm:text-base">날짜 선택</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left text-xs sm:text-sm font-normal border-neutral-200 hover:bg-neutral-50 h-auto py-2"
                        >
                          <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-primary-500" />
                          {date ? (
                            format(date, 'PPP', { locale: ko })
                          ) : (
                            <span className="text-neutral-500">날짜를 선택하세요</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          locale={ko}
                          className="text-xs sm:text-sm"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 시간 선택 */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="time" className="text-sm sm:text-base">시간 선택</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger className="w-full border-neutral-200 text-xs sm:text-sm h-auto py-2">
                        <SelectValue placeholder="시간을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent className="text-xs sm:text-sm">
                        {timeOptions.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 터미널 선택 */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-sm sm:text-base">터미널 선택</Label>
                    <RadioGroup value={terminal} onValueChange={setTerminal} className="flex flex-col space-y-1 sm:space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="terminal1" id="terminal1" />
                        <Label htmlFor="terminal1" className="text-xs sm:text-sm font-normal cursor-pointer">제1터미널</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="terminal2" id="terminal2" />
                        <Label htmlFor="terminal2" className="text-xs sm:text-sm font-normal cursor-pointer">제2터미널</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* 목적지 입력 */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="destination" className="text-sm sm:text-base">목적지</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-neutral-400" />
                      <Input
                        id="destination"
                        placeholder="게이트 번호 또는 시설명을 입력하세요"
                        className="pl-8 sm:pl-10 border-neutral-200 text-xs sm:text-sm h-auto py-2"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 탑승 인원 */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="passengers" className="text-sm sm:text-base">탑승 인원</Label>
                    <div className="flex items-center border rounded-md border-neutral-200 px-3 py-2 bg-white text-xs sm:text-sm">
                      <span className="text-neutral-900">1명</span>
                    </div>
                  </div>

                  {/* 특별 요청사항 */}
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="specialRequests" className="text-sm sm:text-base">특별 요청사항 (선택)</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="특별한 요청사항이 있으시면 입력해주세요"
                      className="border-neutral-200 resize-none text-xs sm:text-sm h-20 sm:h-24"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>

                  <Separator className="my-4 sm:my-6" />

                  {/* 제출 버튼 */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base py-2 sm:py-6 h-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          예약 처리 중...
                        </div>
                      ) : (
                        "예약 확정하기"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* 예약 정보 요약 및 도움말 */}
          <motion.div variants={itemVariants} className="hidden lg:block">
            <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm ring-1 ring-blue-100 h-full">
              <CardHeader className="px-6 py-6">
                <CardTitle className="text-xl flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary-500" />
                  예약 정보 요약
                </CardTitle>
                <CardDescription>
                  입력하신 정보를 확인해주세요
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 space-y-6">
                {/* 여기에 예약 정보 요약 컴포넌트가 들어감 */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">예약 시 참고사항</h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span>예약은 최소 1시간 전에 완료해주세요.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span>예약 시간 10분 전에 지정된 장소에서 대기해주세요.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span>예약 취소는 예약 시간 30분 전까지 가능합니다.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="border-t border-neutral-200 pt-6">
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <Image
                      src="https://picsum.photos/800/450?4"
                      alt="공항 모빌리티 안내 이미지"
                      width={800}
                      height={450}
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-6 pb-6 pt-0 flex justify-center">
                <Button variant="outline" className="text-neutral-700" onClick={() => window.open('/help/reservation', '_blank')}>
                  예약 도움말 보기
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 