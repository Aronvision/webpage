'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

// Props 타입 정의 (global 규칙에 따라 Promise 사용)
interface FlightTicketQrScanPageProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function FlightTicketQrScanPage({ params }: FlightTicketQrScanPageProps) {
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    const initScanner = async () => {
      if (!qrRef.current) return;
      
      try {
        const qrCodeId = 'qr-reader';
        html5QrCode = new Html5Qrcode(qrCodeId);
        setIsScanning(true);
        
        // 화면 크기 계산
        const scannerWidth = qrRef.current.clientWidth;
        const scannerHeight = qrRef.current.clientHeight;
        // 화면의 60%를 차지하는 정사각형 크기 설정
        const edgeLength = Math.min(scannerWidth, scannerHeight) * 0.6;
        
        // 스캐너 시작
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: edgeLength, // 정확한 정사각형을 위해 단일 숫자 값 사용
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // QR 코드가 인식되면 스캐너 중지 후 instant-use 페이지로 이동
            if (html5QrCode) {
              html5QrCode.stop();
            }
            router.push(`/instant-use?data=${encodeURIComponent(decodedText)}`);
          },
          (errorMessage) => {
            // 스캔 중 에러는 무시 (연속적인 스캔 시도 중 발생하는 에러이므로)
          }
        );
        
        // 초기화 이후 잠시 지연 후 DOM 요소 스타일 강제 적용
        setTimeout(() => {
          if (!qrRef.current) return;
          
          // 하단 모든 UI 요소 숨기기
          const dashboardSection = document.getElementById('qr-reader__dashboard_section');
          if (dashboardSection) {
            dashboardSection.style.display = 'none';
          }
          
          // 스캔 상태 텍스트 숨기기
          const statusSpan = document.getElementById('qr-reader__status_span');
          if (statusSpan) {
            statusSpan.style.display = 'none';
          }
          
          // 하단 회색 영역 숨기기
          const scanTypeSelectors = document.querySelectorAll('#qr-reader section div');
          scanTypeSelectors.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none';
            }
          });
          
          // 스캔 영역 스타일 조정
          const qrRegion = document.querySelector('#qr-reader div[style*="position: absolute"] div[style*="border"]');
          if (qrRegion && qrRegion instanceof HTMLElement) {
            qrRegion.style.border = '4px solid white';
            qrRegion.style.borderRadius = '10px';
          }
          
          // 전체 스캐너 영역에서 하단 여백 제거
          const scannerRegion = document.querySelector('#qr-reader');
          if (scannerRegion && scannerRegion instanceof HTMLElement) {
            scannerRegion.style.margin = '0';
            scannerRegion.style.padding = '0';
            scannerRegion.style.height = '100%';
          }
          
          // 스캐너 내부의 모든 섹션 숨기기
          const scannerSections = document.querySelectorAll('#qr-reader section');
          scannerSections.forEach((section) => {
            if (section instanceof HTMLElement) {
              section.style.display = 'none';
            }
          });
        }, 500); // 라이브러리가 DOM을 완전히 구성할 시간을 주기 위해 지연
        
      } catch (err) {
        setError('카메라를 활성화할 수 없습니다. 카메라 접근 권한을 확인해주세요.');
        setIsScanning(false);
      }
    };
    
    initScanner();
    
    // 컴포넌트 언마운트 시 스캐너 중지
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .catch(err => console.error('스캐너 종료 중 오류가 발생했습니다:', err));
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLW9wYWNpdHk9Ii4xNSIgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIvPjwvZz48L3N2Zz4=')] bg-[size:24px_24px] opacity-50 pointer-events-none"></div>
      
      <div className="flex flex-col items-center">
        <Card className="w-full max-w-md shadow-xl relative z-10 bg-white/90 backdrop-blur-sm ring-1 ring-blue-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">항공권 QR 코드 스캔</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="w-full md:w-[400px] h-[400px] bg-neutral-200 rounded-lg shadow-inner overflow-hidden relative">
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <Camera className="w-12 h-12 text-neutral-400 mb-3" />
                  <p className="text-neutral-700 text-center">{error}</p>
                </div>
              ) : !isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <Camera className="w-12 h-12 text-neutral-400 mb-3" />
                    <p className="text-neutral-500">카메라 준비 중...</p>
                  </div>
                </div>
              ) : null}
              <div id="qr-reader" ref={qrRef} className="w-full h-full">
                <style jsx global>{`
                  /* QR 스캐너 전체 스타일 재정의 */
                  #qr-reader {
                    border: none !important;
                    width: 100% !important;
                    height: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: hidden !important;
                    background: transparent !important;
                  }
                  
                  /* 하단 요소 완전히 제거 */
                  #qr-reader section,
                  #qr-reader__dashboard_section,
                  #qr-reader__dashboard_section_csr,
                  #qr-reader__dashboard_section_swaplink,
                  #qr-reader__status_span,
                  #qr-reader header,
                  #qr-reader footer {
                    display: none !important;
                    height: 0 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                  }
                  
                  /* QR 인식 영역 스타일 조정 */
                  #qr-reader div[style*="position: absolute"] {
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  
                  #qr-reader div[style*="position: absolute"] div[style*="border"] {
                    border: 4px solid white !important;
                    border-radius: 10px !important;
                    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.3) !important;
                    width: 240px !important;
                    height: 240px !important;
                  }
                  
                  /* 비디오 영역 전체 화면 차지하도록 설정 */
                  #qr-reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                  }
                `}</style>
              </div>
            </div>
            <p className="text-sm text-neutral-500 text-center mt-2">
              항공권의 QR 코드를 화면 중앙에 위치시켜 주세요.
            </p>
          </CardContent>
        </Card>
        <p className="text-xs text-neutral-400 mt-4">
          QR 스캔 기능은 사용자의 카메라 접근 권한이 필요합니다.
        </p>
      </div>
    </div>
  );
} 