'use client';

import { useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { toast } from 'sonner';
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface NavigationPageProps {
  params: {
    id: string;
  };
}

export default function NavigationPage({ params }: NavigationPageProps) {
  const [mqttClient, setMqttClient] = useState<MqttClient | null>(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const router = useRouter();
  const goalReachedTopic = 'navigation/web';

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
      return;
    }

    const options = {
      // port: parseInt(port, 10), // 제거
      username: username,
      password: password,
      clientId: `web_client_${Math.random().toString(16).substr(2, 8)}`,
      connectTimeout: 5000, // 추가: 5초 연결 타임아웃
    };

    // console.log(`Attempting to connect to MQTT broker at ${brokerUrl}:${port}`); // 수정
    console.log(`Attempting to connect to MQTT broker at ${brokerUrl}`);
    const client = mqtt.connect(brokerUrl, options);
    setMqttClient(client);

    client.on('connect', () => {
      console.log('Successfully connected to MQTT broker via WebSocket');
      client.subscribe(goalReachedTopic, { qos: 1 }, (error) => {
        if (error) {
          console.error(`Failed to subscribe to topic ${goalReachedTopic}:`, error);
          toast.error('MQTT 구독 오류', { description: `토픽 구독 실패: ${goalReachedTopic}` });
        } else {
          console.log(`Successfully subscribed to topic: ${goalReachedTopic}`);
        }
      });
    });

    client.on('message', (topic, message) => {
      const messageString = message.toString();
      console.log(`Received message from topic ${topic}: ${messageString}`);

      if (topic === goalReachedTopic) {
        try {
          const payload = JSON.parse(messageString);
          if (payload.status === 'arrived') {
            console.log('Goal reached message received!');
            // toast.success('안내가 완료되었습니다 🎉');
            setCompletionDialogOpen(true);
            console.log('111');// 필요하다면 여기서 추가적인 UI 변경 로직을 넣을 수 있습니다.
          }
        } catch (e) {
          console.error('Failed to parse message JSON:', e);
        }
      }
    });

    client.on('error', (error) => {
      console.error('MQTT Connection Error:', error);
      toast.error('MQTT 연결 오류', { description: '브로커 연결 중 문제가 발생했습니다.' });
    });

    client.on('close', () => {
      console.log('MQTT connection closed');
    });

    // 컴포넌트 언마운트 시 MQTT 연결 종료
    return () => {
      if (client) {
        console.log('Disconnecting MQTT client...');
        client.end();
        setMqttClient(null);
      }
    };
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 한 번만 실행

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-blue-50/70 to-sky-50/90">
      {/* 기존 네비게이션 페이지 내용 */}
      <h1 className="text-2xl p-4">Navigation for ID: {params.id}</h1>
      <p className="p-4">Waiting for navigation completion...</p>
      {/* 여기에 네비게이션 관련 UI 요소들이 위치합니다. */}

      {/* 안내 완료 다이얼로그 */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">안내 완료</DialogTitle>
            <DialogDescription className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <span className="text-lg">안내가 완료되었습니다 🎉</span>
              <p className="mt-2 text-sm text-neutral-600">
                목적지에 안전하게 도착했습니다. 이용해 주셔서 감사합니다.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center pt-2">
            <Button 
              onClick={() => {
                setCompletionDialogOpen(false);
                router.push('/map');
              }}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              지도로 돌아가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 