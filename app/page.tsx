"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Check, Copy, Clock, Download, X, FileText, QrCode, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import AdUnit from "@/components/ad-unit"
import Footer from "@/components/footer"
import QRCode from "react-qr-code"
import PremiumUpgradeButton from "@/components/premium-upgrade-button"
import PremiumUpgradeDialog from "@/components/premium-upgrade-dialog"
import { MAX_FILE_SIZE, updateQuotaUsage, wouldExceedQuota, getRemainingQuota, formatBytes } from "@/lib/upload-quota"
import { getPremiumStatus, getDailyUploadLimit } from "@/lib/premium-tier"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploaded, setIsUploaded] = useState(false)
  const [shareableLink, setShareableLink] = useState("")
  const [expiryType, setExpiryType] = useState("downloads")
  const [downloadLimit, setDownloadLimit] = useState(1)
  const [timeLimit, setTimeLimit] = useState(24)
  const [showQrCode, setShowQrCode] = useState(false)
  const [fileSizeError, setFileSizeError] = useState(false)
  const [quotaError, setQuotaError] = useState(false)
  // Update the initial state to set a default value for remaining quota
  const [remainingQuota, setRemainingQuota] = useState(50 * 1024 * 1024) // Default to 50MB
  const [quotaPercentage, setQuotaPercentage] = useState(100) // Default to 100%
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [oversizedFile, setOversizedFile] = useState<File | null>(null)
  const [dailyLimit, setDailyLimit] = useState<number>(50 * 1024 * 1024) // Default to 50MB

  // Update quota information when component mounts
  useEffect(() => {
    const updateQuotaInfo = async () => {
      try {
        const { isPremium } = await getPremiumStatus()
        setIsPremium(isPremium)

        const limit = await getDailyUploadLimit()
        setDailyLimit(limit)

        const remaining = getRemainingQuota()
        setRemainingQuota(remaining)

        // Fix: Set the percentage based on remaining quota (100% when full)
        setQuotaPercentage(Math.max(0, (remaining / limit) * 100))
      } catch (error) {
        console.error("Error updating quota info:", error)
        // Fallback to defaults
        setRemainingQuota(50 * 1024 * 1024)
        setQuotaPercentage(100)
        setDailyLimit(50 * 1024 * 1024)
      }
    }

    updateQuotaInfo()
  }, [])

  // Function to update the quota display
  const updateQuotaDisplay = async () => {
    try {
      const limit = await getDailyUploadLimit()
      const remaining = getRemainingQuota()
      setRemainingQuota(remaining)
      setDailyLimit(limit)
      // Fix: Set the percentage based on remaining quota (100% when full)
      setQuotaPercentage(Math.max(0, (remaining / limit) * 100))
    } catch (error) {
      console.error("Error updating quota display:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setFileSizeError(false)
    setQuotaError(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]

      // Check file size
      if (droppedFile.size > MAX_FILE_SIZE) {
        setFileSizeError(true)
        toast({
          title: "File too large",
          description: "The maximum file size allowed is 50MB.",
          variant: "destructive",
        })
        return
      }

      // Check daily quota
      if (wouldExceedQuota(droppedFile.size)) {
        setQuotaError(true)
        setOversizedFile(droppedFile)
        setShowUpgradeDialog(true)
        return
      }

      setFile(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSizeError(false)
    setQuotaError(false)

    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileSizeError(true)
        toast({
          title: "File too large",
          description: "The maximum file size allowed is 50MB.",
          variant: "destructive",
        })
        return
      }

      // Check daily quota
      if (wouldExceedQuota(selectedFile.size)) {
        setQuotaError(true)
        setOversizedFile(selectedFile)
        setShowUpgradeDialog(true)
        return
      }

      setFile(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFileSizeError(false)
    setQuotaError(false)
  }

  const uploadFile = async () => {
    if (!file) return

    // Double-check file size before upload
    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError(true)
      toast({
        title: "File too large",
        description: "The maximum file size allowed is 50MB.",
        variant: "destructive",
      })
      return
    }

    // Double-check quota before upload
    if (wouldExceedQuota(file.size)) {
      setQuotaError(true)
      setOversizedFile(file)
      setShowUpgradeDialog(true)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Create form data
    const formData = new FormData()
    formData.append("file", file)
    formData.append("expiryType", expiryType)
    formData.append("downloadLimit", downloadLimit.toString())
    formData.append("timeLimit", timeLimit.toString())

    try {
      // Simulate progress (in a real app, you might use upload progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Upload the file
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setUploadProgress(100)

      // Update quota after successful upload
      updateQuotaUsage(file.size)
      updateQuotaDisplay()

      // Short delay to show 100% progress
      setTimeout(() => {
        setIsUploading(false)
        setIsUploaded(true)
        setShareableLink(data.shareUrl)
      }, 500)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
    toast({
      title: "Link copied",
      description: "The shareable link has been copied to your clipboard.",
    })
  }

  const toggleQrCode = () => {
    setShowQrCode(!showQrCode)
  }

  const handleUpgradeDialogClose = () => {
    setShowUpgradeDialog(false)
    setOversizedFile(null)
  }

  if (isUploaded) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
          {/* Top ad banner */}
          <div className="w-full max-w-4xl mb-6">
            <AdUnit slot="1234567890" format="horizontal" />
          </div>

          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h1 className="text-2xl font-bold">Upload Complete!</h1>
                <p className="text-muted-foreground">Your file is ready to be shared</p>

                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input value={shareableLink} readOnly className="flex-1 bg-muted" />
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={toggleQrCode}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>

                  {showQrCode && (
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
                      <QRCode
                        value={shareableLink}
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                        fgColor="#000000"
                        bgColor="#FFFFFF"
                      />
                      <p className="text-xs text-muted-foreground mt-2">Scan to download</p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      {expiryType === "downloads"
                        ? `This link will expire after ${downloadLimit} download${downloadLimit > 1 ? "s" : ""} or 72 hours, whichever comes first.`
                        : `This link will expire after ${timeLimit} hour${timeLimit > 1 ? "s" : ""}.`}
                    </p>
                  </div>

                  {/* Daily quota information */}
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily upload limit remaining:</span>
                      <span>{formatBytes(remainingQuota)}</span>
                    </div>
                    <Progress value={quotaPercentage} className="h-2" />
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setFile(null)
                        setIsUploaded(false)
                        setUploadProgress(0)
                        setShowQrCode(false)
                        updateQuotaDisplay()
                      }}
                    >
                      Upload Another File
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom ad banner */}
          <div className="w-full max-w-4xl mt-6">
            <AdUnit slot="0987654321" format="horizontal" />
          </div>
        </main>
        <Footer />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
        {/* Top ad banner */}
        <div className="w-full max-w-4xl mb-6">
          <AdUnit slot="1234567890" format="horizontal" />
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <h1 className="text-2xl font-bold">Share Files Securely</h1>
              <p className="text-muted-foreground">Upload a file to get a self-destructing link</p>

              {/* Daily quota information */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily upload limit remaining:</span>
                  <span>{formatBytes(remainingQuota)}</span>
                </div>
                <Progress value={quotaPercentage} className="h-2" />

                {/* Premium tier badge if user is premium */}
                {isPremium && (
                  <div className="flex items-center justify-center mt-1">
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-full">
                      Premium
                    </span>
                  </div>
                )}
              </div>

              {fileSizeError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>File too large</AlertTitle>
                  <AlertDescription>
                    The maximum file size allowed is 50MB. Please select a smaller file.
                  </AlertDescription>
                </Alert>
              )}

              {quotaError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Daily upload limit reached</AlertTitle>
                  <AlertDescription>
                    You have {formatBytes(remainingQuota)} remaining today. Try again tomorrow or upgrade to premium.
                  </AlertDescription>
                </Alert>
              )}

              <div
                className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 mt-4 transition-colors
                  ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted"}
                  ${fileSizeError || quotaError ? "border-destructive bg-destructive/5" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Uploading {file?.name}...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drag & drop your file here</p>
                    <p className="text-xs text-muted-foreground mt-1">or</p>
                    <label htmlFor="file-upload">
                      <div className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                        Browse Files
                      </div>
                      <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Maximum file size: 50MB | Daily limit: {formatBytes(dailyLimit)}
                    </p>
                  </>
                )}
              </div>

              {file && !isUploading && (
                <div className="w-full space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm font-medium mb-2">Selected File</div>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="flex items-center justify-between text-sm p-2 bg-background rounded">
                        <div className="flex items-center overflow-hidden">
                          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground mr-2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue={expiryType} onValueChange={setExpiryType} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="downloads">Downloads</TabsTrigger>
                      <TabsTrigger value="time">Time</TabsTrigger>
                    </TabsList>
                    <TabsContent value="downloads" className="space-y-4">
                      <p className="text-sm text-muted-foreground mt-2">Link will expire after:</p>
                      <RadioGroup defaultValue="1" className="grid grid-cols-3 gap-2">
                        {[1, 3, 5].map((num) => (
                          <div key={num} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={num.toString()}
                              id={`downloads-${num}`}
                              onClick={() => setDownloadLimit(num)}
                            />
                            <Label htmlFor={`downloads-${num}`}>
                              {num} {num === 1 ? "download" : "downloads"}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <p className="text-xs text-muted-foreground mt-2">
                        All files automatically expire after 72 hours, even if not downloaded {downloadLimit}{" "}
                        {downloadLimit === 1 ? "time" : "times"}.
                      </p>
                    </TabsContent>
                    <TabsContent value="time" className="space-y-4">
                      <p className="text-sm text-muted-foreground mt-2">Link will expire after:</p>
                      <RadioGroup defaultValue="24" className="grid grid-cols-3 gap-2">
                        {[1, 24, 72].map((hours) => (
                          <div key={hours} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={hours.toString()}
                              id={`time-${hours}`}
                              onClick={() => setTimeLimit(hours)}
                            />
                            <Label htmlFor={`time-${hours}`}>{hours === 1 ? "1 hour" : `${hours} hours`}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </TabsContent>
                  </Tabs>

                  <Button
                    className="w-full"
                    onClick={uploadFile}
                    disabled={quotaError || fileSizeError || remainingQuota < file.size}
                  >
                    Upload File
                  </Button>
                </div>
              )}

              {/* Premium upgrade button */}
              {!isPremium && <PremiumUpgradeButton className="mt-2" />}

              <div className="w-full pt-4 flex flex-col space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Files automatically expire</span>
                </div>
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  <span>No login required</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom ad banner */}
        <div className="w-full max-w-4xl mt-6">
          <AdUnit slot="0987654321" format="horizontal" />
        </div>
      </main>
      <Footer />
      <Toaster />

      {/* Premium upgrade dialog */}
      <PremiumUpgradeDialog
        isOpen={showUpgradeDialog}
        onClose={handleUpgradeDialogClose}
        fileSize={oversizedFile?.size || 0}
        remainingQuota={remainingQuota}
      />
    </div>
  )
}

