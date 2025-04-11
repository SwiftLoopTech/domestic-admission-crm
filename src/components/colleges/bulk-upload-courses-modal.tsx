"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/colleges/file-upload"
import { 
  UploadIcon, 
  DownloadIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { Course } from "./add-course-modal"
import { Separator } from "@/components/ui/separator"

interface BulkUploadCoursesModalProps {
  onBulkUpload: (courses: Omit<Course, "id">[]) => void
}

export function BulkUploadCoursesModal({ onBulkUpload }: BulkUploadCoursesModalProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const validateCsvRow = (row: any): boolean => {
    // Check if the row has any non-empty value
    return Object.values(row).some(value => value && value.toString().trim() !== '')
  }

  const handleCsvParse = (data: any[]) => {
    try {
      // Filter out empty rows and validate data
      const validRows = data.filter(row => validateCsvRow(row))
      
      // Validate required fields
      const invalidRows = validRows.filter(row => !row.COURSE || !row.COLLEGE)
      
      if (invalidRows.length > 0) {
        setError(`${invalidRows.length} rows are missing required fields (COURSE or COLLEGE)`)
        setParsedData([])
        return
      }

      setParsedData(validRows)
      setError(null)
    } catch (err) {
      setError("Failed to parse CSV data. Please check the format.")
      setParsedData([])
    }
  }

  const handleFileChange = (file: File | null) => {
    setFile(file)
    if (!file) {
      setParsedData([])
      setError(null)
    }
  }

  const handleDownloadTemplate = () => {
    const headers = "SLNO,COURSE,COLLEGE,PLACE,TOTAL FEE,1ST YR,2ND YR,3RD YR,4TH YR,HOSTEL/FOOD\n";
    const sampleRow = "1,Computer Science,Harvard University,Cambridge,400000,100000,100000,100000,100000,80000\n";
    const emptyRows = Array.from({ length: 10 }, (_, i) => `${i + 2},,,,,,,,,\n`).join('');
    
    const csvContent = headers + sampleRow + emptyRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'courses_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    if (parsedData.length === 0) {
      setError("No valid data found in the CSV file")
      return
    }

    try {
      // Map CSV data to course objects
      const courses = parsedData.map(row => ({
        slno: row.SLNO?.toString() || "",
        course: row.COURSE?.toString() || "",
        college: row.COLLEGE?.toString() || "",
        place: row.PLACE?.toString() || "",
        totalFee: row["TOTAL FEE"]?.toString() || "",
        firstYearFee: row["1ST YR"]?.toString() || "",
        secondYearFee: row["2ND YR"]?.toString() || "",
        thirdYearFee: row["3RD YR"]?.toString() || "",
        fourthYearFee: row["4TH YR"]?.toString() || "",
        hostelFood: row["HOSTEL/FOOD"]?.toString() || ""
      }))

      onBulkUpload(courses)
      
      // Reset and close modal
      setFile(null)
      setParsedData([])
      setError(null)
      setOpen(false)
    } catch (err) {
      setError("Failed to process the CSV data. Please check the format.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700"
        >
          <UploadIcon className="mr-2 h-4 w-4" />
          Bulk Upload Courses
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-white p-0 gap-0 border-none">
        <DialogHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-t-lg">
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Upload Courses
          </DialogTitle>
          <DialogDescription className="text-teal-50">
            Upload your course information using our CSV template
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {/* Template Download Section */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
            <div className="flex items-start gap-4">
              <div className="bg-teal-100 rounded-full p-2">
                <DownloadIcon className="h-5 w-5 text-teal-700" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-medium text-teal-900">Download Template</h3>
                <p className="text-sm text-teal-700">
                  Use our pre-formatted CSV template for accurate data upload
                </p>
                <Button 
                  type="button" 
                  onClick={handleDownloadTemplate}
                  className="bg-white hover:bg-teal-50 text-teal-700 border-teal-200 mt-2"
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Get CSV Template
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-2">
                <UploadIcon className="h-5 w-5 text-blue-700" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-medium text-blue-900">Upload Your Data</h3>
                <p className="text-sm text-blue-700">
                  Select your completed CSV file to import courses
                </p>
                <FileUpload 
                  onFileChange={handleFileChange}
                  onCsvParse={handleCsvParse}
                  label="Choose CSV file" 
                  accept=".csv" 
                  maxSize={10}
                  isCsv={true}
                />
              </div>
            </div>
          </div>
          
          {/* Status Messages */}
          {parsedData.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-emerald-800">
                    Successfully parsed {parsedData.length} courses
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Ready to upload. Click the button below to proceed.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    {error}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Please check your CSV file and try again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="p-6 bg-gray-50 rounded-b-lg">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={parsedData.length === 0}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700"
          >
            {parsedData.length > 0 ? (
              <>
                Upload {parsedData.length} Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Upload Courses'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
