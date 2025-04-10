"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface AdUnitProps {
  slot: string
  format?: "auto" | "horizontal" | "vertical" | "rectangle"
  responsive?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function AdUnit({ slot, format = "auto", responsive = true, className = "", style = {} }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // Check if adsbygoogle is defined
      if (adRef.current && (window as any).adsbygoogle) {
        // Push the ad
        ;(window as any).adsbygoogle.push({})
      } else {
        // If not defined yet, wait and try again
        const timer = setTimeout(() => {
          if (adRef.current && (window as any).adsbygoogle) {
            ;(window as any).adsbygoogle.push({})
          }
        }, 1000)

        return () => clearTimeout(timer)
      }
    } catch (error) {
      console.error("Error displaying ad:", error)
    }
  }, [])

  const defaultStyle: React.CSSProperties = {
    display: "block",
    textAlign: "center",
    minHeight:
      format === "horizontal" ? "90px" : format === "vertical" ? "600px" : format === "rectangle" ? "250px" : "100px",
    ...style,
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={defaultStyle}
        data-ad-client="ca-pub-1237004726725642"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  )
}

