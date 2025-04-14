"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadIcon, XIcon } from "lucide-react"

interface FileUploadProps {
  onFileChange: (file: File | null) => void
  onCsvParse?: (data: any[]) => void // Optional callback for parsed CSV data
  label?: string
  accept?: string
  maxSize?: number // in MB
  isCsv?: boolean // Flag to indicate if this is a CSV upload
}

export function FileUpload({
  onFileChange,
  onCsvParse,
  label = "Upload file",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 5, // 5MB default
  isCsv = false,
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setError(null)

    if (file) {
      // Check file size (convert maxSize from MB to bytes)
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB limit`)
        setFileName(null)
        onFileChange(null)
        return
      }

      setFileName(file.name)
      onFileChange(file)

      // If this is a CSV file and we have a parse callback, read and parse the CSV
      if (isCsv && onCsvParse && file.name.endsWith('.csv')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const csvText = event.target?.result as string
            const rows = csvText.split('\n')
            const headers = rows[0].split(',')

            const data = rows.slice(1)
              .filter(row => row.trim() !== '') // Skip empty rows
              .map(row => {
                const values = row.split(',')
                const rowData: Record<string, string> = {}

                headers.forEach((header, index) => {
                  rowData[header.trim()] = values[index]?.trim() || ''
                })

                return rowData
              })

            onCsvParse(data)
          } catch (err) {
            setError('Failed to parse CSV file. Please check the format.')
          }
        }

        reader.onerror = () => {
          setError('Failed to read the file')
        }

        reader.readAsText(file)
      }
    } else {
      setFileName(null)
      onFileChange(null)
    }
  }

  const handleClearFile = () => {
    setFileName(null)
    setError(null)
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <UploadIcon className="mr-2 h-4 w-4" />
            {fileName ? "Change file" : "Select file"}
          </Button>
        </div>

        {fileName && (
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
            <span className="truncate max-w-[200px]">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearFile}
              className="h-5 w-5"
            >
              <XIcon className="h-3 w-3" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Accepted file types: {accept.split(",").join(", ")}. Max size: {maxSize}MB
        </p>
      </div>
    </div>
  )
}
