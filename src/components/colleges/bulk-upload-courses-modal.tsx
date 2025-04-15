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
  ArrowRight,
  Building2
} from "lucide-react"
import { Database } from "@/types/supabase"
import { collegeService } from "@/services/colleges"
import { useBulkAddCourses } from "@/hooks/useCourses"
import { toast } from "sonner"
import { useAddCollege } from "@/hooks/useColleges"

type Course = Database['public']['Tables']['courses']['Row']
type CreateCourseInput = Database['public']['Tables']['courses']['Insert']

interface ValidationResult {
  existingColleges: { name: string; place: string }[];
  newColleges: { name: string; place: string }[];
  validRows: any[];
  invalidRows: any[];
}

export function BulkUploadCoursesModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const bulkAddMutation = useBulkAddCourses()
  const addCollegeMutation = useAddCollege()

  const validateCsvRow = (row: any): boolean => {
    return Object.values(row).some(value => value && value.toString().trim() !== '')
  }

  const validateAndProcessData = async (data: any[]) => {
    try {
      setIsProcessing(true)
      
      const validRows = data.filter(row => validateCsvRow(row))
      
     
      const invalidRows = validRows.filter(row => !row.COURSE || !row.COLLEGE || !row.PLACE)
      
      if (invalidRows.length > 0) {
        setError(`${invalidRows.length} rows are missing required fields (COURSE, COLLEGE, or PLACE)`)
        setParsedData([])
        return
      }

      // Get unique college-place combinations from CSV
      const collegesFromCsv = Array.from(new Set(
        validRows.map(row => JSON.stringify({ name: row.COLLEGE.trim(), place: row.PLACE.trim() }))
      )).map(str => JSON.parse(str));

      // Check which colleges exist in DB
      const existingColleges: { name: string; place: string }[] = []
      const newColleges: { name: string; place: string }[] = []

      for (const college of collegesFromCsv) {
        const exists = await collegeService.checkCollegeExists(college.name, college.place)
        if (exists) {
          existingColleges.push(college)
        } else {
          newColleges.push(college)
        }
      }

      setValidation({
        existingColleges,
        newColleges,
        validRows,
        invalidRows
      })

      setParsedData(validRows)
      setError(null)
    } catch (err) {
      setError("Failed to validate colleges. Please try again.")
      toast.error("Failed to validate colleges")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCsvParse = (data: any[]) => {
    validateAndProcessData(data)
  }

  const handleFileChange = (file: File | null) => {
    setFile(file)
    setValidation(null)
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

  const handleSubmit = async () => {
    console.log(parsedData)
    if (parsedData.length === 0) {
      setError("No valid data found in the CSV file")
      toast.error("No valid data found in the CSV file")
      return
    }

    try {
      setIsProcessing(true)

      // First create any new colleges
      if (validation?.newColleges.length) {
        for (const college of validation.newColleges) { 
          addCollegeMutation.mutateAsync({
            brochureFile:null,
            collegeData:{
              name: college.name,
              location: college.place,
              website_url: null,
              contact_number: null,
              agent_id: null,
              brochure_url: null,
            }
          })
          
        }
      }
      

      // Map CSV data to course objects
      const courses: CreateCourseInput[] = await Promise.all(
        parsedData.map(async (row) => {
          // Get college_id based on name and place
          const college = await collegeService.getCollegeByNameAndPlace(
            row.COLLEGE.trim(),
            row.PLACE.trim()
          )
          console.log(college)
          return {
            slno: row.SLNO?.toString() || "",
            course_name: row.COURSE?.toString() || "",
            college_id: college?.id || "",
            duration_years: 4, // Default value
            fees: {
              total: parseFloat(row["TOTAL FEE"] || "0"),
              firstYear: parseFloat(row["1ST YR"] || "0"),
              secondYear: parseFloat(row["2ND YR"] || "0"),
              thirdYear: parseFloat(row["3RD YR"] || "0"),
              fourthYear: parseFloat(row["4TH YR"] || "0"),
            },
            hostel_food_fee: parseFloat(row["HOSTEL/FOOD"] || "0"),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        })
      )

      
      await bulkAddMutation.mutateAsync(courses)
      
      
      setFile(null)
      setParsedData([])
      setError(null)
      setValidation(null)
      setOpen(false)

      toast.success(`Successfully uploaded ${courses.length} courses`)
    } catch (err) {
      setError("Failed to process the data. Please try again.")
      toast.error("Failed to process the data")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="bg-white hover:bg-amber-500"
        >
          <UploadIcon className="mr-2 h-4 w-4" />
          Bulk Upload Courses
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-white p-0 gap-0 border-none">
        <DialogHeader className="bg-[#222B38] p-6 rounded-t-lg">
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
          
          {/* Validation Results */}
          {validation && (
            <div className="space-y-3">
              {validation.existingColleges.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Existing Colleges Found ({validation.existingColleges.length})
                      </p>
                      
                    </div>
                  </div>
                </div>
              )}

              {validation.newColleges.length > 0 && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        New Colleges to Create ({validation.newColleges.length})
                      </p>
                      <div className="mt-2 text-xs text-amber-600 space-y-1">
                        {validation.newColleges.map((college, idx) => (
                          <p key={idx}>{college.name} - {college.place}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
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
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={parsedData.length === 0 || isProcessing || bulkAddMutation.isPending}
            className="bg-[#FFC11F] hover:bg-[#FFC11F] text-black border-[#FFC11F]"
          >
            {isProcessing || bulkAddMutation.isPending ? (
              <>
                <ArrowRight className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : parsedData.length > 0 ? (
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
