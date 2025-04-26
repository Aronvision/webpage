'use client';

import { useEffect, useState } from 'react';

interface MobileViewportProps {
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export function MobileViewport({
  width = 412,
  height = 896,
  children
}: MobileViewportProps) {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    // 개발 환경에서만 모바일 뷰를 적용합니다
    setIsDevMode(process.env.NODE_ENV === 'development');
  }, []);

  if (!isDevMode) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 overflow-auto">
      <div 
        className="relative overflow-hidden bg-white shadow-xl rounded-[38px] border-4 border-gray-900"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxHeight: '90vh'
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 z-10 flex justify-center">
          <div className="w-40 h-4 bg-gray-900 rounded-b-xl"></div>
        </div>
        <div className="h-full overflow-auto">{children}</div>
      </div>
    </div>
  );
} 