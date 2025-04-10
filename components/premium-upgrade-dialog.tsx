"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"
import { formatBytes } from "@/lib/upload-quota"
import SolanaPayUpgrade from "./solana-pay-upgrade"
import EmergencyPremiumActivation from "./emergency-premium-activation"

interface PremiumUpgradeDialogProps {
  isOpen: boolean
  onClose: () => void
  fileSize?: number
  remainingQuota: number
}

// This is a placeholder for the actual premium limit
const PREMIUM_DAILY_LIMIT = 500 * 1024 * 1024 // 500MB

export default function PremiumUpgradeDialog({
  isOpen,
  onClose,
  fileSize = 0,
  remainingQuota,
}: PremiumUpgradeDialogProps) {
  const [showDialog, setShowDialog] = useState(true)
  const [showEmergencyActivation, setShowEmergencyActivation] = useState(false)

  // Determine if this is a file size issue or a quota issue
  const isFileSizeIssue = fileSize > 0 && fileSize > remainingQuota

  const handlePaymentSuccess = () => {
    // Refresh the page to update UI
    window.location.reload()
  }

  const handleClose = () => {
    setShowDialog(false)
    onClose()
  }

  return (
    <Dialog open={isOpen && showDialog} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {isOpen && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                Upgrade to Premium
              </DialogTitle>
              <DialogDescription>
                {isFileSizeIssue
                  ? `Your file (${formatBytes(fileSize)}) exceeds your remaining daily quota (${formatBytes(remainingQuota)}).`
                  : `Upgrade to premium for 10x more daily upload capacity (500MB).`}
              </DialogDescription>
            </DialogHeader>

            {showEmergencyActivation ? (
              <EmergencyPremiumActivation onSuccess={handlePaymentSuccess} />
            ) : (
              <SolanaPayUpgrade onSuccess={handlePaymentSuccess} onCancel={handleClose} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

