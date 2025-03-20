"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

// QR 코드 데이터 스키마 정의
const qrDataSchema = z.object({
  id: z.string().min(1, "ID는 필수입니다"),
  name: z.string().min(1, "이름은 필수입니다"),
  type: z.string().min(1, "유형은 필수입니다"),
  date: z.string().optional(),
});

type QRData = z.infer<typeof qrDataSchema>;

export default function QRGeneratePage() {
  const router = useRouter();
  const [qrData, setQrData] = useState<QRData>({
    id: "",
    name: "",
    type: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setQrData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const generateQRCode = () => {
    try {
      // 유효성 검사
      qrDataSchema.parse(qrData);
      setErrors({});

      // JSON 문자열로 변환하여 QR 코드 생성
      const qrString = JSON.stringify(qrData);
      QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H'
      })
        .then(url => {
          setQrImageUrl(url);
        })
        .catch(err => {
          console.error("QR 코드 생성 오류:", err);
          alert("QR 코드 생성 중 오류가 발생했습니다.");
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const downloadQRCode = () => {
    if (!qrImageUrl) return;
    
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `qrcode-${qrData.id}-${qrData.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack} 
          className="p-0 mr-2"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold">QR 코드 생성</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR 코드 정보 입력</CardTitle>
          <CardDescription>QR 코드에 포함할 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ID</label>
            <Input
              name="id"
              value={qrData.id}
              onChange={handleInputChange}
              placeholder="고유 ID를 입력하세요"
            />
            {errors.id && (
              <p className="text-red-500 text-sm mt-1">{errors.id}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <Input
              name="name"
              value={qrData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">유형</label>
            <Input
              name="type"
              value={qrData.type}
              onChange={handleInputChange}
              placeholder="유형을 입력하세요"
            />
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">날짜</label>
            <Input
              type="date"
              name="date"
              value={qrData.date}
              onChange={handleInputChange}
            />
          </div>
          
          <Button 
            className="w-full" 
            onClick={generateQRCode}
          >
            QR 코드 생성
          </Button>
        </CardContent>
        
        {qrImageUrl && (
          <CardFooter className="flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg">
              <img src={qrImageUrl} alt="QR 코드" className="w-full max-w-xs mx-auto" />
            </div>
            <Button 
              onClick={downloadQRCode} 
              className="flex items-center gap-2"
            >
              <Download size={16} />
              QR 코드 다운로드
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 