"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ScanLine } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">QR 코드 관리</h1>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>QR 코드 스캔</CardTitle>
              <CardDescription>
                기존 QR 코드를 스캔하여 정보를 확인합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScanLine className="w-16 h-16 mx-auto text-gray-500" />
            </CardContent>
            <CardFooter>
              <Link href="/qr-scan" className="w-full">
                <Button className="w-full">
                  QR 코드 스캔하기
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR 코드 생성</CardTitle>
              <CardDescription>
                새로운 QR 코드를 생성하고 다운로드합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QrCode className="w-16 h-16 mx-auto text-gray-500" />
            </CardContent>
            <CardFooter>
              <Link href="/qr-generate" className="w-full">
                <Button className="w-full">
                  QR 코드 생성하기
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
