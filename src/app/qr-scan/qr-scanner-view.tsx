"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";
import { z } from "zod";
import mqtt, { IClientOptions } from 'mqtt'; // 메인 패키지 사용 및 타입 import

// QR 코드 데이터 스키마 정의 (생성 페이지와 일치)
const qrDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  date: z.string().optional(),
});

export default function QRScannerView() {
  const router = useRouter();
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true); // 스캔 상태 추가
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);
  const [isConnectingMqtt, setIsConnectingMqtt] = useState(false);
  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);

  // MQTT 연결 설정
  const mqttBrokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'ws://your_broker_address:9001';
  const mqttOptions: Omit<IClientOptions, 'host' | 'port' | 'protocol'> = {
    // host, port, protocol은 URL에서 가져오므로 제거
    username: process.env.NEXT_PUBLIC_MQTT_USERNAME || 'your_username',
    password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || 'your_password',
    clientId: `webapp_client_${Math.random().toString(16).substr(2, 8)}`,
    // 추가 옵션: connectTimeout 등
  };

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
              handleScanSuccess(decodedText);
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

  useEffect(() => {
    // 컴포넌트 언마운트 시 MQTT 연결 해제
    return () => {
      if (mqttClientRef.current?.connected) {
        mqttClientRef.current.end();
        console.log('MQTT client disconnected on component unmount.');
      }
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleManualInput = () => {
    // 직접 입력 페이지로 이동
    router.push('/qr-generate');
  };

  const handleNext = async () => {
    // 페이지 이동 (이 부분은 scanResult 없이 이동하면 문제가 될 수 있으므로 주의)
    router.push('/qr-result');

    // MQTT 메시지 발행 시도
    setIsConnectingMqtt(true);
    setError(null); // 이전 에러 초기화

    try {
      console.log('Attempting to connect to MQTT broker...');
      // 기존 연결이 있으면 재사용, 없으면 새로 연결
      if (!mqttClientRef.current || !mqttClientRef.current.connected) {
        // 첫 번째 인자로 전체 URL 전달
        const client = mqtt.connect(mqttBrokerUrl, mqttOptions);
        mqttClientRef.current = client;

        await new Promise<void>((resolve, reject) => {
          client.on('connect', () => {
            console.log('Successfully connected to MQTT broker via WebSocket');
            resolve();
          });

          client.on('error', (err) => {
            console.error('MQTT Connection Error:', err.message, err.name, err.stack);
            setError(`MQTT 브로커 연결에 실패했습니다: ${err.message}`);
            client.end(); // 연결 종료
            reject(err);
          });

          // 타임아웃 설정 (예: 5초)
          const timeoutId = setTimeout(() => {
             console.error('MQTT connection timed out');
             setError('MQTT 브로커 연결 시간이 초과되었습니다.');
             client.end();
             reject(new Error('Connection timeout'));
          }, 5000);

          client.on('connect', () => clearTimeout(timeoutId)); // 연결 성공 시 타임아웃 제거
          client.on('error', () => clearTimeout(timeoutId)); // 에러 시 타임아웃 제거
        });
      }

       // 연결 성공 후 메시지 발행 (scanResult 조건 제거)
      if (mqttClientRef.current?.connected) {
          const topic = 'scan/complete';
          // 발행할 데이터를 "hi!" 메시지로 고정
          const message = JSON.stringify({
            message: "hi!", // 고정 메시지
            timestamp: new Date().toISOString(),
          });

          mqttClientRef.current.publish(topic, message, { qos: 0, retain: false }, (err) => {
            if (err) {
              console.error('MQTT Publish Error:', err.message, err.name, err.stack);
              setError(`MQTT 메시지 발행에 실패했습니다: ${err.message}`);
            } else {
              console.log(`Successfully published to topic ${topic}: ${message}`);
              // 성공적으로 발행 후 연결 종료 또는 유지 결정
              // mqttClientRef.current?.end();
            }
          });
      }
      // scanResult 없는 경우의 경고 로그 제거

    } catch (error: any) {
      // 연결 또는 발행 중 발생한 에러는 이미 setError로 처리됨
      console.error('MQTT operation failed:', error.message || error);
      if (!error) { // Ensure error is defined before accessing message
        setError(`MQTT 작업 중 예기치 않은 오류 발생: ${error?.message || '알 수 없는 오류'}`);
      }
    } finally {
      setIsConnectingMqtt(false);
    }
  };

  const handleScanAgain = () => {
    setError(null);
    setIsScanning(true); // 다시 스캔 시작
    
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
          // 동일한 처리 로직 사용
          handleScanSuccess(decodedText);
        },
        () => {}
      ).catch(err => {
        console.error("스캐너 재시작 실패:", err);
        setHasCamera(false);
        setIsScanning(false);
      });
    }
  };

  // QR 스캔 성공 시 처리 함수
  const handleScanSuccess = (decodedText: string) => {
    console.log("스캔 결과:", decodedText);
    
    // 즉시 스캔 상태 변경으로 UI 숨김
    setIsScanning(false);
    
    try {
      // JSON 파싱 시도
      const parsedData = JSON.parse(decodedText);
      
      // 스키마 검증
      const validatedData = qrDataSchema.parse(parsedData);
      
      // QR 데이터를 URL 파라미터로 전달하여 결과 페이지로 즉시 이동
      const queryParams = new URLSearchParams({
        data: encodeURIComponent(JSON.stringify(validatedData))
      });
      
      // 바로 페이지 이동 (스캐너 중지를 기다리지 않음)
      router.push(`/qr-result?${queryParams.toString()}`);
      
      // 스캐너 중지는 백그라운드에서 처리 (페이지 이동 후)
      setTimeout(() => {
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(error => 
            console.error("스캐너 중지 실패:", error)
          );
        }
      }, 100);
      
    } catch (err) {
      console.error("QR 코드 데이터 파싱 오류:", err);
      setIsScanning(true); // 에러 시 다시 스캔 가능하도록
      if (err instanceof SyntaxError) {
        setError("유효하지 않은 QR 코드 형식입니다.");
      } else if (err instanceof z.ZodError) {
        setError("QR 코드에 필요한 정보가 없습니다.");
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
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
            {!error && isScanning && (
              <div className="absolute top-1/4 -translate-y-[40px] left-0 right-0 text-white text-center z-10 px-4">
                <h2 className="text-2xl font-medium mb-2">QR코드를</h2>
                <p className="text-2xl font-medium">영역에 맞춰 스캔해주세요.</p>
              </div>
            )}

            {/* 스캔 완료 후 로딩 표시 */}
            {!isScanning && !error && (
              <div className="absolute inset-0 bg-black bg-opacity-90 z-30 flex flex-col items-center justify-center p-4">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">페이지 이동 중...</p>
                </div>
              </div>
            )}

            {/* 에러 메시지 표시 (QR 스캔 에러 또는 연결 에러) */}
            {error && (
              <div className="absolute inset-0 bg-black bg-opacity-90 z-20 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                  <h3 className="text-xl font-bold mb-4 text-center text-red-600">오류 발생</h3>
                  <p className="text-center mb-6 text-red-500">{error}</p>
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
            <div className={`w-full h-full relative ${error || !isScanning ? 'opacity-30' : ''}`}>
              <div id="qr-reader" className="w-full h-full" />
              
              {/* 스캔 프레임 - 스캔 중일 때만 표시 */}
              {isScanning && (
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
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-red-500 p-4 z-10">
            카메라를 사용할 수 없습니다. 카메라 권한을 허용해주세요.
          </div>
        )}
      </div>

      {/* MQTT 연결 중 표시 (선택 사항) */}
      {isConnectingMqtt && (
         <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
           <p className="text-white text-lg">MQTT 브로커에 연결 중...</p>
         </div>
      )}

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
        /* html5-qrcode 기본 UI 요소들 완전히 숨김 */
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
        #qr-reader__header_message {
          display: none !important;
        }
        #qr-reader__camera_selection {
          display: none !important;
        }
        #qr-reader__camera_permission_button {
          display: none !important;
        }
        /* 모든 텍스트 메시지 숨김 */
        #qr-reader div[style*="text-align"] {
          display: none !important;
        }
        #qr-reader span {
          display: none !important;
        }
        #qr-reader p {
          display: none !important;
        }
        /* QR 코드 인식 성공 메시지 숨김 */
        #qr-reader div[style*="color: rgb(255, 255, 255)"] {
          display: none !important;
        }
        #qr-reader div[style*="background-color"] {
          background: transparent !important;
        }
        #qr-reader div {
          background: transparent !important;
          color: transparent !important;
        }
        /* 스캔 결과 영역 숨김 */
        #qr-reader div:not(video):not([id*="camera"]) {
          opacity: 0 !important;
          visibility: hidden !important;
        }
      `}</style>
    </div>
  );
}