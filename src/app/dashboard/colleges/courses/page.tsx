"use client"

import { useState } from "react"
import { Database } from "@/types/supabase"
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddCourseModal } from "@/components/colleges/add-course-modal"
import { BulkUploadCoursesModal } from "@/components/colleges/bulk-upload-courses-modal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  BookOpenIcon, 
  BuildingIcon, 
  MapPinIcon, 
  DollarSignIcon,
  SearchIcon,
  GraduationCapIcon,
  BedDoubleIcon,
  Loader2Icon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCourses } from "@/hooks/useCourses"
import { useColleges } from "@/hooks/useColleges"

type Course = Database['public']['Tables']['courses']['Row']
type College = Database['public']['Tables']['colleges']['Row']

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  // Get both courses and colleges data
  const { 
    data: coursesData, 
    isLoading: isLoadingCourses, 
    isError: isErrorCourses 
  } = useCourses({
    searchTerm: searchTerm,
    limit: 50
  })

  const {
    data: collegesData,
    isLoading: isLoadingColleges,
    isError: isErrorColleges
  } = useColleges()

  const isLoading = isLoadingCourses || isLoadingColleges
  const isError = isErrorCourses || isErrorColleges

  const getCollegeDetails = (collegeId: string) => {
    return collegesData?.colleges.find(college => college.id === collegeId)
  }

  const formatCurrency = (amount: string) => {
    return `₹${parseInt(amount).toLocaleString('en-IN')}`
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load courses. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCapIcon className="h-6 w-6" />
              Available Courses
            </h1>
            <p className="text-teal-50">Manage and explore course offerings across universities</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <AddCourseModal />
            <BulkUploadCoursesModal />
          </div>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search courses by name, college, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-lg border-2 border-gray-200 focus:border-teal-500 rounded-xl shadow-sm"
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-3 text-lg text-gray-600">Loading courses...</span>
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData?.courses.map((course) => {
            const college = getCollegeDetails(course.college_id)
            return (
              <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-200 border">
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-200">
                      #{course.slno}
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      {course.duration_years} Years
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center text-xl">
                    <BookOpenIcon className="h-6 w-6 mr-2 text-teal-600" />
                    {course.course_name}
                  </CardTitle>
                  <div className="space-y-2">
                    <CardDescription className="flex items-center text-base">
                      <BuildingIcon className="h-5 w-5 mr-2 text-gray-500" />
                      {college?.name || 'College not found'}
                    </CardDescription>
                    <CardDescription className="flex items-center text-base">
                      <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                      {college?.location || 'Location not available'}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardFooter className="pt-4">
                  <Button 
                    onClick={() => setSelectedCourse(course)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                  >
                    <DollarSignIcon className="h-4 w-4 mr-2" />
                    View Complete Details
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Course Details Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          {selectedCourse && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2 text-teal-700">
                  <BookOpenIcon className="h-6 w-6" />
                  {selectedCourse.course_name}
                </DialogTitle>
                {(() => {
                  const college = getCollegeDetails(selectedCourse.college_id||"")
                  return (
                    <div className="flex flex-col gap-2 mt-2">
                      <p className="flex items-center text-gray-600">
                        <BuildingIcon className="h-5 w-5 mr-2" />
                        {college?.name || 'College not found'}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        {college?.location || 'Location not available'}
                      </p>
                    </div>
                  )
                })()}
              </DialogHeader>

              <div className="space-y-6">
                {/* Total Fee Card */}
                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-teal-700 font-medium">Total Course Fee</span>
                    <span className="text-2xl font-bold text-teal-700">
                      {formatCurrency(((selectedCourse.fees as { total: number })?.total || 0).toString())}
                    </span>
                  </div>
                </div>

                {/* Year-wise Fee Breakdown */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Year-wise Fee Structure</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">First Year</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(((selectedCourse.fees as { firstYear: number })?.firstYear || 0).toString())}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">Second Year</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(((selectedCourse.fees as { secondYear: number })?.secondYear || 0).toString())}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">Third Year</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(((selectedCourse.fees as { thirdYear: number })?.thirdYear || 0).toString())}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600">Fourth Year</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(((selectedCourse.fees as { fourthYear: number })?.fourthYear || 0).toString())}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hostel & Food Fee */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BedDoubleIcon className="h-5 w-5 text-orange-600" />
                      <span className="text-orange-700 font-medium">Hostel & Food (per year)</span>
                    </div>
                    <span className="text-xl font-bold text-orange-700">
                      {formatCurrency((selectedCourse.hostel_food_fee || 0).toString())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {!isLoading && coursesData?.courses.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          {searchTerm ? (
            <div className="space-y-2">
              <SearchIcon className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-lg text-gray-600">No courses found matching "{searchTerm}"</p>
              <p className="text-sm text-gray-500">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="space-y-2">
              <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="text-lg text-gray-600">No courses added yet</p>
              <p className="text-sm text-gray-500">
                Click the "Add Course" button to add your first course or use "Bulk Upload" to import multiple courses
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
