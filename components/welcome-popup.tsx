"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("hasVisitedBefore")

    if (!hasVisited) {
      setIsOpen(true)
      // Mark as visited for future visits
      localStorage.setItem("hasVisitedBefore", "true")
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to TransferPal</DialogTitle>
          <DialogDescription>Thank you for trying our secure file sharing service</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            TransferPal is currently in beta. While fully functional, you may encounter occasional issues as we continue
            to improve the service.
          </p>
          <p className="text-sm text-muted-foreground">
            If you experience any problems or have feedback, please contact us at{" "}
            <a href="mailto:transferpalpro@gmail.com" className="text-primary hover:underline">
              transferpalpro@gmail.com
            </a>
            .
          </p>
        </div>

        <DialogFooter className="flex justify-end">
          <Button onClick={handleClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

