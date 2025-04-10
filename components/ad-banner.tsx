"use client"

import { useEffect, useRef } from "react"

interface AdBannerProps {
  adSlot: string
  format?: "auto" | "horizontal" | "vertical" | "rectangle"
  className?: string
}

export default function AdBanner({ adSlot, format = "auto", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (adRef.current && (window as any).adsbygoogle) {
      try {
        // Push the ad to AdSense
        ;(window as any).adsbygoogle.push({})
      } catch (error) {
        console.error("Error displaying ad:", error)
      }
    }
  }, [])

  // Map format to size
  const adStyle = {
    display: "block",
    textAlign: "center" as const,
    minHeight:
      format === "horizontal" ? "90px" : format === "vertical" ? "600px" : format === "rectangle" ? "250px" : "100px",
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

