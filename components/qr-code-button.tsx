"use client"

import { useState } from "react"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import QRCode from "react-qr-code"

interface QrCodeButtonProps {
  value: string
}

export default function QrCodeButton({ value }: QrCodeButtonProps) {
  const [showQrCode, setShowQrCode] = useState(false)

  const toggleQrCode = () => {
    setShowQrCode(!showQrCode)
  }

  return (
    <div className="flex flex-col items-center">
      <Button variant="outline" size="sm" onClick={toggleQrCode} className="mb-2">
        <QrCode className="h-4 w-4 mr-2" />
        {showQrCode ? "Hide QR Code" : "Show QR Code"}
      </Button>

      {showQrCode && (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
          <QRCode
            value={value}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
            fgColor="#000000"
            bgColor="#FFFFFF"
          />
          <p className="text-xs text-muted-foreground mt-2">Scan to download</p>
        </div>
      )}
    </div>
  )
}

