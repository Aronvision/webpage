"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { z } from "zod";

// QR 코드 데이터 스키마 정의 (생성 페이지와 일치)
const qrDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  date: z.string().optional(),
});

type QRData = z.infer<typeof qrDataSchema>;

export default function QRScannerView() {
  const router = useRouter();
  const [hasCamera, setHasCamera] = useState(true);
  const [scanResult, setScanResult] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(error => console.error("스캐너 중지 실패:", error));
        }
      };
    }
  }, []);

  useEffect(() => {
    if (scannerRef.current && !scannerRef.current.isScanning) {
      const startScanning = async () => {
        try {
          await scannerRef.current?.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              // QR 코드 스캔 성공
              console.log("스캔 결과:", decodedText);
              try {
                // JSON 파싱 시도
                const parsedData = JSON.parse(decodedText);
                
                // 스키마 검증
                const validatedData = qrDataSchema.parse(parsedData);
                
                // 스캔 완료 후 스캐너 중지
                if (scannerRef.current?.isScanning) {
                  scannerRef.current.stop().catch(error => 
                    console.error("스캐너 중지 실패:", error)
                  );
                }
                
                // 스캔 결과 저장
                setScanResult(validatedData);
                setError(null);
                
                // 결과 페이지로 이동 (선택적)
                // router.push(`/qr-result?data=${encodeURIComponent(decodedText)}`);
              } catch (err) {
                console.error("QR 코드 데이터 파싱 오류:", err);
                if (err instanceof SyntaxError) {
                  setError("유효하지 않은 QR 코드 형식입니다.");
                } else if (err instanceof z.ZodError) {
                  setError("QR 코드에 필요한 정보가 없습니다.");
                } else {
                  setError("알 수 없는 오류가 발생했습니다.");
                }
              }
            },
            (errorMessage) => {
              // QR 스캔 에러(이 함수는 QR 코드를 찾지 못했을 때도 호출됨)
              // 지속적인 스캔을 위해 여기서는 에러 처리하지 않음
            }
          );
        } catch (err) {
          console.error("카메라 시작 실패:", err);
          setHasCamera(false);
        }
      };

      startScanning();
    }
  }, [router]);

  const handleClose = () => {
    router.back();
  };

  const handleManualInput = () => {
    // 직접 입력 페이지로 이동
    router.push('/qr-generate');
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setError(null);
    
    // 스캐너 다시 시작
    if (scannerRef.current && !scannerRef.current.isScanning) {
      scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // 위와 동일한 처리 로직 (코드 중복 방지를 위해 생략)
          try {
            const parsedData = JSON.parse(decodedText);
            const validatedData = qrDataSchema.parse(parsedData);
            
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().catch(e => console.error("스캐너 중지 실패:", e));
            }
            
            setScanResult(validatedData);
            setError(null);
          } catch (err) {
            console.error("QR 코드 데이터 파싱 오류:", err);
            if (err instanceof SyntaxError) {
              setError("유효하지 않은 QR 코드 형식입니다.");
            } else if (err instanceof z.ZodError) {
              setError("QR 코드에 필요한 정보가 없습니다.");
            } else {
              setError("알 수 없는 오류가 발생했습니다.");
            }
          }
        },
        () => {}
      ).catch(err => {
        console.error("스캐너 재시작 실패:", err);
        setHasCamera(false);
      });
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-black">
      {/* 상단 닫기 버튼 */}
      <div className="absolute top-0 left-0 p-4 z-10">
        <button 
          onClick={handleClose}
          className="text-white p-2"
          aria-label="닫기"
        >
          <X size={24} />
        </button>
      </div>

      {/* QR 스캐너 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        {hasCamera ? (
          <>
            {!scanResult && !error && (
              <div className="absolute top-1/4 left-0 right-0 text-white text-center z-10 px-4">
                <h2 className="text-2xl font-medium mb-2">QR코드를</h2>
                <p className="text-2xl font-medium">영역에 맞춰 스캔해주세요.</p>
              </div>
            )}

            {/* 스캔 결과 표시 */}
            {scanResult && (
              <div className="absolute inset-0 bg-black bg-opacity-90 z-20 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                  <h3 className="text-xl font-bold mb-4 text-center">스캔 결과</h3>
                  <div className="space-y-2">
                    <p><span className="font-semibold">ID:</span> {scanResult.id}</p>
                    <p><span className="font-semibold">이름:</span> {scanResult.name}</p>
                    <p><span className="font-semibold">유형:</span> {scanResult.type}</p>
                    {scanResult.date && (
                      <p><span className="font-semibold">날짜:</span> {scanResult.date}</p>
                    )}
                  </div>
                  <div className="mt-6 flex flex-col gap-2">
                    <button 
                      onClick={handleScanAgain}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium"
                    >
                      다시 스캔하기
                    </button>
                    <button 
                      onClick={handleClose}
                      className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium"
                    >
                      완료
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 에러 메시지 표시 */}
            {error && (
              <div className="absolute inset-0 bg-black bg-opacity-90 z-20 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                  <h3 className="text-xl font-bold mb-4 text-center text-red-600">오류 발생</h3>
                  <p className="text-center mb-6">{error}</p>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleScanAgain}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium"
                    >
                      다시 스캔하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QR 스캐너 뷰 */}
            <div className={`w-full h-full relative ${(scanResult || error) ? 'opacity-30' : ''}`}>
              <div id="qr-reader" className="w-full h-full" />
              
              {/* 스캔 프레임 */}
              <div 
                ref={qrBoxRef}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  width: '280px',
                  height: '280px',
                  pointerEvents: 'none',
                }}
              >
                {/* 투명한 모서리 영역 */}
                <div className="absolute inset-0 border-2 border-white rounded-lg"></div>
                
                {/* 코너 마커 */}
                <div className="absolute left-0 top-0 w-10 h-10 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                <div className="absolute right-0 top-0 w-10 h-10 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                <div className="absolute left-0 bottom-0 w-10 h-10 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                <div className="absolute right-0 bottom-0 w-10 h-10 border-b-2 border-r-2 border-white rounded-br-lg"></div>
                
                {/* 중앙 십자 표시 */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center">
                  <div className="w-full h-px bg-white opacity-80"></div>
                  <div className="h-full w-px bg-white opacity-80 absolute"></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-red-500 p-4 z-10">
            카메라를 사용할 수 없습니다. 카메라 권한을 허용해주세요.
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="p-4 bg-black text-center z-10">
        <button
          onClick={handleManualInput}
          className="bg-transparent text-white py-4 px-6 rounded-md w-full font-medium text-lg"
        >
          QR 코드 생성하기
        </button>
      </div>

      <style jsx global>{`
        #qr-reader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          background: #000;
        }
        #qr-reader video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        #qr-reader__scan_region {
          display: none !important;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
        #qr-reader__status_span {
          display: none !important;
        }
        #qr-reader__dashboard_section {
          display: none !important;
        }
        #qr-reader__dashboard_section_csr {
          display: none !important;
        }
        #qr-reader__dashboard_section_fsr {
          display: none !important;
        }
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
        #qr-reader div {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}