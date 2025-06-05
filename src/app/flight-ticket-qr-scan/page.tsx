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
            qrRegion.style.border = '4px solid #3b82f6';
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
      {/* 폴리곤 패턴 배경 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGgxMHYxMEgwem0xMCAwaDEwdjEwSDEwem0xMCAwaDEwdjEwSDIwem0xMCAwaDEwdjEwSDMwem0xMCAwaDEwdjEwSDQwem0xMCAwaDEwdjEwSDUwek0wIDEwaDEwdjEwSDB6bTEwIDBoMTB2MTBIMTBtMTAgMGgxMHYxMEgyMG0xMCAwaDEwdjEwSDMwbTEwIDBoMTB2MTBINDBtMTAgMGgxMHYxMEgyMG0xMCAwaDEwdjEwSDMwbTEwIDBoMTB2MTBINDBtMTAgMGgxMHYxMEg1MHpNMCAyMGgxMHYxMEgwbTEwIDBoMTB2MTBIMTBtMTAgMGgxMHYxMEgyMG0xMCAwaDEwdjEwSDMwbTEwIDBoMTB2MTBINDBtMTAgMGgxMHYxMEgyMG0xMCAwaDEwdjEwSDMwbTEwIDBoMTB2MTBINDBtMTAgMGgxMHYxMEg1MHpNMCAzMGgxMHYxMEgwbTEwIDBoMTB2MTBIMTBtMTAgMGgxMHYxMEgyMG0xMCAwaDEwdjEwSDMwbTEwIDBoMTB2MTBINDBtMTAgMGgxMHYxMEg1MHpNMCA0MGgxMHYxMEgwbTEwIDBoMTB2MTBIMTBtMTAgMGgxMHYxMEgyMG0xMCAwaDEwdjEwSDMwbTEwIDBoMTB2MTBINDBtMTAgMGgxMHYxMEg1MHpNMCA1MGgxMHYxMEgwbTEwIDBoMTB2MTBIMTBtMTAgMGgxMHYxMEgyMG0xMCAwaDEwdjEwSDMwbTEwIDBoMTB2MTBINDBtMTAgMGgxMHYxMEg1MHoiIG9wYWNpdHk9Ii4wNSIgZmlsbD0iIzNiODJmNiIvPjwvc3ZnPg==')] bg-[size:60px_60px] opacity-25 mix-blend-overlay pointer-events-none"></div>
      
      {/* 빛나는 원형 그라데이션 */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-200/30 to-blue-300/30 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-sky-200/20 to-blue-100/20 blur-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col items-center relative z-10">
        <Card className="w-full max-w-md shadow-2xl relative z-10 bg-sky-200/90 backdrop-blur-xl border border-blue-200 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-100/30 pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between border-b border-blue-300/40">
            <CardTitle className="text-2xl font-bold text-blue-900">항공권 QR 코드 스캔</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-neutral-600 hover:bg-blue-50/50">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 pt-6">
            <div className="w-full md:w-[400px] h-[400px] bg-black/10 rounded-lg shadow-inner overflow-hidden relative border border-blue-100">
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <Camera className="w-12 h-12 text-neutral-500 mb-3" />
                  <p className="text-neutral-700 text-center">{error}</p>
                </div>
              ) : !isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <Camera className="w-12 h-12 text-neutral-500 mb-3" />
                    <p className="text-neutral-600">카메라 준비 중...</p>
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
                    border: 3px solid #3b82f6 !important;
                    border-radius: 12px !important;
                    box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.15) !important;
                    animation: pulse 2s infinite !important;
                    width: 240px !important;
                    height: 240px !important;
                  }
                  
                  @keyframes pulse {
                    0% {
                      box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(59, 130, 246, 0.7) !important;
                    }
                    70% {
                      box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.15), 0 0 0 10px rgba(59, 130, 246, 0) !important;
                    }
                    100% {
                      box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(59, 130, 246, 0) !important;
                    }
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
            <p className="text-sm text-neutral-600 text-center mt-2 px-4">
              항공권의 QR 코드를 화면 중앙에 위치시켜 주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 