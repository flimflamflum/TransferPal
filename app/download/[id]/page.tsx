"use client"

import { useState, useEffect } from "react"
import { FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import AdUnit from "@/components/ad-unit"
import Footer from "@/components/footer"
import FilePreview from "@/components/file-preview"
import QrCodeButton from "@/components/qr-code-button"

interface FileData {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  fileUrl: string
  downloadCount: number
  isExpired: boolean
  expiryType: string
  downloadLimit: number | null
  timeLimit: number | null
}

export default function DownloadPage({ params }: { params: { id: string } }) {
  const [isExpired, setIsExpired] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await fetch(`/api/download/${params.id}`)

        if (response.status === 410) {
          setIsExpired(true)
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch file data")
        }

        const data = await response.json()
        setFileData(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching file data:", error)
        setError("Failed to load file information")
        setIsLoading(false)
      }
    }

    fetchFileData()
  }, [params.id])

  const handleDownload = async () => {
    if (!fileData) return

    setIsDownloading(true)
    setDownloadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    try {
      // Fetch the file with a direct download approach
      const response = await fetch(`/api/direct-download/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to download file")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a")
      a.href = url
      a.download = fileData.fileName
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      clearInterval(progressInterval)
      setDownloadProgress(100)

      // Short delay to show 100% progress
      setTimeout(() => {
        setIsDownloading(false)
        toast({
          title: "Download started",
          description: `Your file "${fileData.fileName}" is being downloaded.`,
        })

        // If this was the last download, show expired
        if (fileData.isExpired) {
          setIsExpired(true)
        }
      }, 500)
    } catch (error) {
      console.error("Error downloading file:", error)
      clearInterval(progressInterval)
      setIsDownloading(false)
      setError("Failed to download file")
      toast({
        title: "Download failed",
        description: "There was an error downloading your file. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold">Loading File...</h1>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
          <Toaster />
        </main>
        <Footer />
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
          {/* Top ad banner */}
          <div className="w-full max-w-4xl mb-6">
            <AdUnit slot="1234567890" format="horizontal" />
          </div>

          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-300" />
                </div>
                <h1 className="text-2xl font-bold">This link has expired</h1>
                <p className="text-muted-foreground">
                  The file is no longer available for download. The link may have reached its download limit or time
                  expiration.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bottom ad banner */}
          <div className="w-full max-w-4xl mt-6">
            <AdUnit slot="0987654321" format="horizontal" />
          </div>
          <Toaster />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-background to-muted/50">
        {/* Top ad banner */}
        <div className="w-full max-w-4xl mb-6">
          <AdUnit slot="1234567890" format="horizontal" />
        </div>

        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">File Ready to Download</h1>

              {fileData && (
                <div className="w-full space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <span className="font-medium">{fileData.fileName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(fileData.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>

                    {/* File Preview */}
                    <div className="mt-4">
                      <FilePreview
                        fileUrl={fileData.fileUrl}
                        fileName={fileData.fileName}
                        fileType={fileData.fileType}
                        onDownload={handleDownload}
                      />
                    </div>
                  </div>

                  {/* QR Code for the download link */}
                  <QrCodeButton value={window.location.href} />

                  <p className="text-sm text-muted-foreground pt-2">
                    This link will expire after download or when the time limit is reached.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side ad banner for larger screens */}
        <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2">
          <AdUnit slot="5678901234" format="vertical" />
        </div>

        {/* Bottom ad banner */}
        <div className="w-full max-w-4xl mt-6">
          <AdUnit slot="0987654321" format="horizontal" />
        </div>
        <Toaster />
      </main>
      <Footer />
    </div>
  )
}

