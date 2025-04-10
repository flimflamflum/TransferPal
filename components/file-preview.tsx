"use client"

import { useState } from "react"
import Image from "next/image"
import { FileImage, File, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilePreviewProps {
  fileUrl: string
  fileName: string
  fileType: string
  onDownload: () => void
}

export default function FilePreview({ fileUrl, fileName, fileType, onDownload }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine if the file is previewable
  const isImage = fileType.startsWith("image/")
  const isPdf = fileType === "application/pdf"
  const isText =
    fileType.startsWith("text/") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".json") ||
    fileName.endsWith(".csv")

  const canPreview = isImage || isPdf || isText

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setError("Failed to load image preview")
  }

  if (!canPreview) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <File className="h-8 w-8 text-primary" />
        </div>
        <p className="text-center text-muted-foreground mb-4">Preview not available for this file type</p>
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download File
        </Button>
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-full max-h-[400px] overflow-hidden rounded-lg bg-muted mb-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <FileImage className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}
          <Image
            src={fileUrl || "/placeholder.svg"}
            alt={fileName}
            width={800}
            height={600}
            className="object-contain w-full h-full"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Original
        </Button>
      </div>
    )
  }

  if (isPdf) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-full h-[500px] mb-4 rounded-lg overflow-hidden border">
          <iframe src={`${fileUrl}#toolbar=0&navpanes=0`} className="w-full h-full" title={fileName} />
        </div>
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    )
  }

  if (isText) {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="w-full h-[300px] mb-4 rounded-lg overflow-auto bg-muted p-4 font-mono text-sm">
          <iframe src={fileUrl} className="w-full h-full border-0" title={fileName} />
        </div>
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download File
        </Button>
      </div>
    )
  }

  return null
}

