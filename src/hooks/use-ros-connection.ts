'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
// 서버 사이드 렌더링 문제 해결을 위한 동적 import
import type ROSLIB from 'roslib';

interface UseRosConnectionOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

const defaultOptions: UseRosConnectionOptions = {
  url: 'ws://localhost:9090', // 기본 ROS 브릿지 서버 주소
  autoConnect: true,
  reconnectInterval: 3000, // 3초마다 재연결 시도
  maxReconnectAttempts: 5, // 최대 5번 재연결 시도
  heartbeatInterval: 5000, // 5초마다 핑 전송
};

export function useRosConnection(options: UseRosConnectionOptions = {}) {
  const config = { ...defaultOptions, ...options };
  const [ros, setRos] = useState<any | null>(null);
  const [roslibModule, setRoslibModule] = useState<typeof ROSLIB | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const isReconnectingRef = useRef(false);

  // roslib 모듈 동적 로딩
  useEffect(() => {
    let isMounted = true;
    
    const loadRoslib = async () => {
      try {
        // 동적으로 roslib 모듈 불러오기
        const roslibModule = await import('roslib');
        if (isMounted) {
          setRoslibModule(roslibModule.default);
        }
      } catch (err) {
        console.error('roslib 모듈 로딩 오류:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('roslib 모듈을 로딩할 수 없습니다.'));
        }
      }
    };
    
    loadRoslib();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 하트비트(핑) 함수 - 연결 유지를 위해 주기적으로 더미 메시지 전송
  const startHeartbeat = useCallback((rosInstance: any) => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    heartbeatTimerRef.current = setInterval(() => {
      if (mountedRef.current && rosInstance && rosInstance.isConnected) {
        try {
          // 핑-퐁 대신 간단한 토픽 발행으로 연결 유지
          const topic = new roslibModule!.Topic({
            ros: rosInstance,
            name: '/heartbeat',
            messageType: 'std_msgs/Empty'
          });
          
          topic.advertise();
          
          setTimeout(() => {
            topic.unadvertise();
          }, 100);
        } catch (err) {
          console.warn('하트비트 전송 중 오류:', err);
        }
      }
    }, config.heartbeatInterval);
  }, [config.heartbeatInterval, roslibModule]);

  // 연결 해제 함수
  const cleanupConnection = useCallback(() => {
    // 하트비트 타이머 정리
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    
    // 재연결 타이머 정리
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  // ROS 연결 함수
  const connect = useCallback(() => {
    if (!mountedRef.current || !roslibModule || isReconnectingRef.current) return;
    
    isReconnectingRef.current = true;
    
    try {
      // 이전 연결 정리
      cleanupConnection();
      
      // 이전 연결이 있으면 종료
      if (ros) {
        try {
          ros.close();
          setRos(null);
        } catch (err) {
          console.error('기존 연결 종료 중 오류:', err);
        }
      }

      console.log(`ROS 브릿지 서버(${config.url})에 연결 시도 중...`);
      
      const newRos = new roslibModule.Ros({
        url: config.url,
        // 연결 안정성을 위한 추가 옵션
        transportLibrary: 'websocket',
        groovyCompatibility: true,
      });

      // 연결 이벤트 핸들러
      newRos.on('connection', () => {
        if (!mountedRef.current) return;
        
        console.log('ROS 브릿지 서버에 연결되었습니다.');
        setIsConnected(true);
        setError(null);
        setReconnectCount(0);
        isReconnectingRef.current = false;
        
        // 연결 유지를 위한 하트비트 시작
        startHeartbeat(newRos);
      });

      // 오류 이벤트 핸들러
      newRos.on('error', (err) => {
        if (!mountedRef.current) return;
        
        console.error('ROS 브릿지 서버 연결 오류:', err);
        setError(new Error('ROS 브릿지 서버 연결에 실패했습니다.'));
        
        // 오류 발생 시에는 상태를 명시적으로 변경하지 않고 'close' 이벤트에서 처리
      });

      // 연결 종료 이벤트 핸들러
      newRos.on('close', () => {
        if (!mountedRef.current) return;
        
        console.log('ROS 브릿지 서버 연결이 종료되었습니다.');
        setIsConnected(false);
        
        // 하트비트 중지
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        
        // 자동 재연결 시도 - 이미 재연결 중이 아닐 때만 시도
        if (!isReconnectingRef.current && reconnectCount < (config.maxReconnectAttempts || 0)) {
          console.log(`재연결 시도 중... (${reconnectCount + 1}/${config.maxReconnectAttempts})`);
          
          // 기존 재연결 타이머 제거
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
          }
          
          // 새 재연결 타이머 설정
          reconnectTimerRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setReconnectCount(prevCount => prevCount + 1);
              isReconnectingRef.current = false;
              connect();
            }
          }, config.reconnectInterval);
        } else {
          isReconnectingRef.current = false;
        }
      });

      setRos(newRos);
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('ROS 연결 중 오류 발생:', err);
      setError(err instanceof Error ? err : new Error('알 수 없는 오류가 발생했습니다.'));
      setIsConnected(false);
      isReconnectingRef.current = false;
    }
  }, [config.url, config.reconnectInterval, config.maxReconnectAttempts, reconnectCount, ros, roslibModule, cleanupConnection, startHeartbeat]);

  // ROS 연결 종료 함수
  const disconnect = useCallback(() => {
    if (ros) {
      try {
        // 모든 타이머 정리
        cleanupConnection();
        
        setIsConnected(false);
        ros.close();
        setRos(null);
      } catch (err) {
        console.error('ROS 연결 종료 중 오류 발생:', err);
      }
    }
  }, [ros, cleanupConnection]);

  // 토픽 발행 함수
  const publishMessage = useCallback((
    topicName: string,
    messageType: string,
    message: any
  ) => {
    if (!ros || !isConnected || !roslibModule) {
      console.error('ROS에 연결되어 있지 않습니다.');
      return false;
    }

    try {
      const topic = new roslibModule.Topic({
        ros: ros,
        name: topicName,
        messageType: messageType,
        queue_size: 10,
        throttle_rate: 100
      });

      topic.publish(message);
      
      // 토픽 사용 후 정리
      setTimeout(() => {
        topic.unadvertise();
      }, 100);
      
      return true;
    } catch (err) {
      console.error('메시지 발행 중 오류 발생:', err);
      return false;
    }
  }, [ros, isConnected, roslibModule]);

  // 찜하기 기능 함수
  const sendFavoriteDevice = useCallback((deviceId: string) => {
    return publishMessage(
      '/mobile/favorite_device', // 토픽 이름
      'std_msgs/String', // 메시지 타입
      { data: deviceId }
    );
  }, [publishMessage]);

  // roslibModule이 로드되면 자동 연결
  useEffect(() => {
    if (roslibModule && config.autoConnect && !isReconnectingRef.current) {
      // 약간의 지연을 주어 초기화 문제 방지
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          connect();
        }
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [roslibModule, config.autoConnect, connect]);

  // 컴포넌트 마운트 시 설정
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      
      // 모든 타이머 정리
      cleanupConnection();
      
      // 연결 종료
      if (ros) {
        try {
          ros.close();
        } catch (err) {
          console.error('언마운트 시 ROS 연결 종료 오류:', err);
        }
      }
    };
  }, [ros, cleanupConnection]);

  return {
    ros,
    isConnected,
    error,
    connect,
    disconnect,
    publishMessage,
    sendFavoriteDevice,
    reconnectCount,
  };
} 