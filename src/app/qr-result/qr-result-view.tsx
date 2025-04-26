"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function QRResultView() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gradient-to-b from-blue-50 to-blue-100">
      <Card className="w-full max-w-md border-none shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center pb-6 pt-8">
          <div className="rounded-full bg-green-100 p-3 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">QR 스캔 완료</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="text-center mb-8">
            <p className="text-gray-700">
              정상적으로 QR코드가 인식되었습니다.
            </p>
            <p className="text-gray-700 mt-2">
              이제 다음 단계를 진행할 수 있습니다.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full py-6 text-lg" 
              onClick={handleHome}
            >
              홈으로 이동하기
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