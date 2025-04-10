"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if the device is mobile
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }

    checkMobile()

    // Check if the app is already installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
      }
    }

    checkInstalled()

    // Store the event for later use
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent)
      // Show the prompt for mobile devices
      if (!isInstalled) {
        console.log("PWA install prompt available, showing prompt")
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // If no prompt event within 3 seconds and on mobile, show our custom prompt anyway
    const timer = setTimeout(() => {
      if (isMobile && !isInstalled && !showPrompt && !localStorage.getItem("pwaPromptDismissed")) {
        console.log("No install prompt event received, showing custom prompt")
        setShowPrompt(true)
      }
    }, 3000)

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      localStorage.setItem("pwaInstalled", "true")
    }

    window.addEventListener("appinstalled", handleAppInstalled)

    // Clean up event listeners
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(timer)
    }
  }, [isMobile, isInstalled, showPrompt])

  const handleInstallClick = async () => {
    if (installPrompt) {
      // Show the install prompt
      await installPrompt.prompt()

      // Wait for the user to respond to the prompt
      const choiceResult = await installPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
        setIsInstalled(true)
      } else {
        console.log("User dismissed the install prompt")
      }

      // Clear the saved prompt since it can't be used again
      setInstallPrompt(null)
    } else {
      // If no install prompt event, provide instructions
      alert("To install this app on your home screen: tap the share button and select 'Add to Home Screen'")
    }

    setShowPrompt(false)
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    // Store in localStorage that user dismissed the prompt
    localStorage.setItem("pwaPromptDismissed", "true")
  }

  // Don't show if already installed or user dismissed
  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium mb-1">Install TransferPal</h3>
              <p className="text-sm text-muted-foreground mb-3">Add to your home screen for a better experience</p>
              <Button size="sm" onClick={handleInstallClick} className="mr-2">
                <Download className="mr-2 h-4 w-4" />
                Install
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={dismissPrompt} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

