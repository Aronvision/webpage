"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Send } from "lucide-react";
import mqtt, { MqttClient } from 'mqtt';

export default function QRResultView() {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const clientRef = useRef<MqttClient | null>(null);

  useEffect(() => {
    const brokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL;
    const port = process.env.NEXT_PUBLIC_MQTT_WEBSOCKET_PORT;
    const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
    const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

    if (!brokerUrl || !port || !username || !password) {
      console.error('MQTT connection details missing.');
      setConnectionStatus('Config Error');
      return;
    }

    const connectUrl = brokerUrl.replace(/^mqtts?:\/\//, 'wss://');
    const options = {
      port: parseInt(port, 10),
      username: username,
      password: password,
      clientId: `webapp_qr_result_${Math.random().toString(16).substr(2, 8)}`,
      path: '/mqtt',
    };

    console.log(`Connecting to MQTT: ${connectUrl}:${port}${options.path || ''}`);
    setConnectionStatus('Connecting...');
    
    try {
      clientRef.current = mqtt.connect(connectUrl, options);
      const client = clientRef.current;

      client.on('connect', () => {
        console.log('MQTT Connected (QR Result)');
        setConnectionStatus('Connected');
      });
      client.on('error', (error) => {
        console.error('MQTT Error:', error);
        setConnectionStatus(`Error: ${error.message}`);
      });
      client.on('reconnect', () => setConnectionStatus('Reconnecting...'));
      client.on('close', () => setConnectionStatus('Disconnected'));
      client.on('offline', () => setConnectionStatus('Offline'));

    } catch (error) {
       console.error('MQTT connection failed:', error);
       setConnectionStatus('Connection Failed');
    }

    return () => {
      if (clientRef.current) {
        console.log('Disconnecting MQTT (QR Result)...');
        clientRef.current.end(true);
        clientRef.current = null;
      }
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleStartTest = () => {
    if (clientRef.current && connectionStatus === 'Connected' && !isPublishing) {
      const topic = 'robot/command';
      const message = 'start_test';
      
      setIsPublishing(true);
      console.log(`Publishing to ${topic}: ${message}`);

      clientRef.current.publish(topic, message, { qos: 0 }, (error) => {
        setIsPublishing(false);
        if (error) {
          console.error('Publish error:', error);
          alert('명령 전송에 실패했습니다.');
        } else {
          console.log('Successfully published start_test command.');
          alert('노트북/로봇으로 시작 명령을 전송했습니다.');
          router.push("/"); 
        }
      });
    } else if (connectionStatus !== 'Connected') {
       alert('MQTT 브로커에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
    } else if (isPublishing) {
      
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-b from-blue-50 to-blue-100">
      <Card className="w-full max-w-md border-none shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center pb-6 pt-8">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">QR 스캔 완료</CardTitle>
          <p className="text-sm text-gray-500 mt-2">MQTT Status: {connectionStatus}</p>
        </CardHeader>
        
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-gray-700">
              정상적으로 QR코드가 인식되었습니다.
            </p>
            <p className="text-gray-700 mt-2">
              아래 버튼을 눌러 노트북/로봇과의 연결 테스트를 시작하세요.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full py-6 text-lg" 
              onClick={handleStartTest}
              disabled={connectionStatus !== 'Connected' || isPublishing}
            >
              <Send className="mr-2 h-4 w-4" />
              {isPublishing ? '명령 전송 중...' : '노트북 연결 테스트 시작'}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full py-6 text-lg" 
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 화면으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 