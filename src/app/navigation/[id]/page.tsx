'use client';

import { useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { toast } from 'sonner';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle, MapPin, Compass, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NavigationPageProps {
  params: {
    id: string;
  };
}

export default function NavigationPage({ params }: NavigationPageProps) {
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const router = useRouter();
  const goalReachedTopic = 'navigation/web';
  const navigationControlTopic = 'navigation/control';

  useEffect(() => {
    // 환경 변수에서 MQTT 접속 정보 가져오기
    // 중요: .env.local 파일에 NEXT_PUBLIC_ 접두사를 사용하여 변수들을 설정해야 합니다.
    //       또한, 브라우저 연결을 위해 WebSocket 프로토콜(ws:// 또는 wss://)과 포트를 포함한 전체 URL을 사용해야 합니다.
    //       예: ws://your_broker_address:9001
    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
    const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
    const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

    // if (!brokerUrl || !port || !username || !password) { // 수정
    if (!brokerUrl || !username || !password) {
      console.error('MQTT connection details missing in environment variables.');
      toast.error('MQTT 설정 오류', { description: '브로커 연결 정보를 찾을 수 없습니다.' });
      setConnectionStatus('error');
      return;
    }

    const options = {
      // port: parseInt(port, 10), // 제거
      username: username,
      password: password,
      clientId: `web_client_${Math.random().toString(16).substr(2, 8)}`,
      connectTimeout: 5000, // 추가: 5초 연결 타임아웃
    };

    const client = mqtt.connect(brokerUrl, options);
    setMqttClient(client);

    client.on('connect', () => {
      setConnectionStatus('connected');
      client.subscribe(goalReachedTopic, { qos: 1 }, (error) => {
        if (error) {
          console.error(`Failed to subscribe to topic ${goalReachedTopic}:`, error);
          toast.error('MQTT 구독 오류', { description: `토픽 구독 실패: ${goalReachedTopic}` });
        } else {
        }
      });
    });

    client.on('message', (topic, message) => {
      const messageString = message.toString();

      if (topic === goalReachedTopic) {
        try {
          const payload = JSON.parse(messageString);
          if (payload.status === 'arrived') {
            // toast.success('안내가 완료되었습니다 🎉');
            setCompletionDialogOpen(true);
          }
        } catch (e) {
          console.error('Failed to parse message JSON:', e);
        }
      }
    });

    client.on('error', (error) => {
      console.error('MQTT Connection Error:', error);
      toast.error('MQTT 연결 오류', { description: '브로커 연결 중 문제가 발생했습니다.' });
      setConnectionStatus('error');
    });

    client.on('close', () => {
    });

    // 컴포넌트 언마운트 시 MQTT 연결 종료
    return () => {
      if (client) {
        client.end();
        setMqttClient(null);
      }
    };
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 한 번만 실행

  const handleCompleteNavigation = async () => {
    setIsSendingMessage(true);
    
    try {
      if (!mqttClient || !mqttClient.connected) {
        throw new Error('MQTT 클라이언트가 연결되어 있지 않습니다.');
      }

      const message = JSON.stringify({
        command: 'return_to_base',
        navigation_id: params.id,
        timestamp: new Date().toISOString()
      });

      await new Promise<void>((resolve, reject) => {
        mqttClient.publish(navigationControlTopic, message, { qos: 1 }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      setCompletionDialogOpen(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to publish navigation completion message:', error);
      toast.error('안내 종료 메시지 전송 실패', { 
        description: '다시 시도해주세요.'
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleGoToNewDestination = () => {
    setCompletionDialogOpen(false);
    router.push('/qr-result'); // 새로운 목적지 선택을 위해 qr-result 페이지로 이동
  };

  // 애니메이션 관련 클래스 정의
  const pulseAnimation = "animate-pulse";
  const spinAnimation = "animate-spin";
  const pingAnimation = "animate-ping";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="p-6">
          <div className="text-center mb-8 mt-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              안내 진행 중
            </h1>
            <p className="text-gray-600">
              목적지까지 안전하게 안내해드립니다.
            </p>
          </div>

          <div className="flex justify-center my-10">
            <div className="relative">
              {/* 중앙 아이콘 */}
              <div className={cn("p-4 rounded-full bg-blue-500 text-white", connectionStatus === 'connecting' ? pulseAnimation : '')}>
                <Navigation className="h-8 w-8" />
              </div>
            
              {/* 외곽 원 */}
              <div className="absolute -inset-4 border-2 border-dashed border-blue-300 rounded-full"></div>
              
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-700">
              {connectionStatus === 'connecting' ? '연결 중...' : 
               connectionStatus === 'error' ? '연결 오류가 발생했습니다' : 
               '목적지에 도착하면 알려드릴게요'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 안내 완료 다이얼로그 */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">목적지 도착</DialogTitle>
            <DialogDescription className="text-center py-4">
              <span className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </span>
              <span className="text-lg">목적지에 도착했습니다 🎉</span>
            </DialogDescription>
          </DialogHeader>
          <div className="text-center">
            <p className="mt-3 text-sm text-neutral-600">
              다른 목적지를 가려면 '다른 목적지로 가기' 버튼을 눌러주세요.
            </p>
            <p className="mt-2 text-sm text-neutral-600">
              이용을 종료하려면 짐을 내린 후에 '안내 종료' 버튼을 눌러주세요.
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
            <Button 
              onClick={handleGoToNewDestination}
              className="bg-primary-500 hover:bg-primary-600 text-white"
              disabled={isSendingMessage}
            >
              다른 목적지로 가기
            </Button>
            <Button 
              onClick={handleCompleteNavigation}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isSendingMessage}
            >
              {isSendingMessage ? '처리 중...' : '안내 종료'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 