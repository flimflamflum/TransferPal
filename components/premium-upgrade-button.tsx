"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { formatBytes } from "@/lib/upload-quota"
import PremiumUpgradeDialog from "./premium-upgrade-dialog"

interface PremiumUpgradeButtonProps {
  compact?: boolean
  className?: string
}

// This is a placeholder for the actual premium limit
const PREMIUM_DAILY_LIMIT = 500 * 1024 * 1024 // 500MB

export default function PremiumUpgradeButton({ compact = false, className = "" }: PremiumUpgradeButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgradeClick = () => {
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  if (compact) {
    return (
      <>
        <Button
          onClick={handleUpgradeClick}
          className={`bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 ${className}`}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Storage
            </>
          )}
        </Button>

        <PremiumUpgradeDialog isOpen={isDialogOpen} onClose={handleDialogClose} remainingQuota={0} />
      </>
    )
  }

  return (
    <>
      <div
        className={`p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-blue-200 dark:border-blue-900 ${className}`}
      >
        <div className="flex items-center mb-2">
          <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="font-medium">Need more upload capacity?</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Upgrade to Premium for {formatBytes(PREMIUM_DAILY_LIMIT)} daily uploads
        </p>

        <Button
          onClick={handleUpgradeClick}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Upgrade for 0.01 SOL"
          )}
        </Button>
      </div>

      <PremiumUpgradeDialog isOpen={isDialogOpen} onClose={handleDialogClose} remainingQuota={0} />
    </>
  )
}

