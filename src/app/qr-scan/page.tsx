"use client";

import React from "react";
import QRScannerView from "./qr-scanner-view";

export default function QRScanPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <QRScannerView />
    </div>
  );
} 