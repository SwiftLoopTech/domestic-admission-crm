"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCollege } from "@/hooks/useColleges";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BuildingIcon,
  MapPinIcon,
  PhoneIcon,
  ExternalLinkIcon,
  FileIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  GraduationCapIcon,
  DollarSignIcon,
  BedDoubleIcon,
  Loader2Icon,
  ChevronDownIcon,
  ChevronUpIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { CollegeWithCourses, CourseWithTypedFees } from "@/types/colleges";

export default function CollegeDetailsPage() {
  const params = useParams();
  const collegeId = params.id as string;
  const { data, isLoading, error } = useCollege(collegeId);
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(new Set());

  // Cast the college data to the correct type
  const college = data as CollegeWithCourses;

  // Function to toggle course expansion
  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourseIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-3 text-lg text-gray-600">Loading college details...</span>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-red-700">{error?.message || "College not found"}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/colleges">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Colleges
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#222B38] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-teal-50 text-black hover:bg-teal-100">
                Institution
              </Badge>
            </div>
            <h1 className="text-3xl font-medium text-white flex items-center gap-2">
              <BuildingIcon className="h-6 w-6" />
              {college.name}
            </h1>
            <p className="text-white/60 text-sm flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {college.location}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="bg-white text-black hover:bg-gray-100"
              asChild
            >
              <Link href="/dashboard/colleges">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Colleges
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* College Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>College Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="font-medium">{college.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="font-medium">{college.location}</p>
              </div>
              {college.contact_number && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Contact Number</p>
                  <p className="font-medium flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                    {college.contact_number}
                  </p>
                </div>
              )}
              {college.website_url && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <a
                    href={college.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            {college.brochure_url && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium mb-2">College Brochure</h3>
                <a
                  href={college.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <FileIcon className="h-5 w-5 mr-2" />
                  Download Brochure
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>College Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  Available Courses
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {college.courses?.length || 0}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center">
                  <GraduationCapIcon className="h-4 w-4 mr-2" />
                  Average Duration
                </span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  {college.courses && college.courses.length > 0
                    ? `${Math.round(
                        college.courses.reduce((acc: number, course: CourseWithTypedFees) => acc + (course.duration_years || 0), 0) /
                          college.courses.length
                      )} years`
                    : "N/A"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Courses</h2>
        </div>

        {college.courses && college.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {college.courses.map((course: CourseWithTypedFees) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-600 hover:bg-amber-300">
                      #{course.slno || "N/A"}
                    </Badge>
                    <Badge variant="outline" className="border-blue-200 text-zinc-900">
                      {course.duration_years} Years
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-2">{course.course_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Fee Information - Always Visible */}
                  {course.fees && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center text-gray-600">
                          <DollarSignIcon className="h-4 w-4 mr-1 text-green-600" />
                          Total Fee
                        </span>
                        <span className="font-bold text-green-700">
                          {formatCurrency(
                            (course.fees.firstYear || 0) +
                            (course.fees.secondYear || 0) +
                            (course.fees.thirdYear || 0) +
                            (course.fees.fourthYear || 0) +
                            (course.fees.fifthYear || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Expanded Details Section */}
                  {expandedCourseIds.has(course.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-6">
                      {/* Year-wise Fee Breakdown */}
                      <div>
                        <h3 className="text-md font-medium mb-3">Year-wise Fee Structure</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {(course.fees.firstYear || 0) > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-600 text-sm">First Year</p>
                              <p className="text-md font-semibold">
                                {formatCurrency(course.fees.firstYear || 0)}
                              </p>
                            </div>
                          )}
                          {(course.fees.secondYear || 0) > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-600 text-sm">Second Year</p>
                              <p className="text-md font-semibold">
                                {formatCurrency(course.fees.secondYear || 0)}
                              </p>
                            </div>
                          )}
                          {(course.fees.thirdYear || 0) > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-600 text-sm">Third Year</p>
                              <p className="text-md font-semibold">
                                {formatCurrency(course.fees.thirdYear || 0)}
                              </p>
                            </div>
                          )}
                          {(course.fees.fourthYear || 0) > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-600 text-sm">Fourth Year</p>
                              <p className="text-md font-semibold">
                                {formatCurrency(course.fees.fourthYear || 0)}
                              </p>
                            </div>
                          )}
                          {(course.fees.fifthYear || 0) > 0 && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-600 text-sm">Fifth Year</p>
                              <p className="text-md font-semibold">
                                {formatCurrency(course.fees.fifthYear || 0)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hostel & Food Fee */}
                      {(course.hostel_food_fee || 0) > 0 && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <BedDoubleIcon className="h-4 w-4 text-orange-600" />
                              <span className="text-orange-700 font-medium text-sm">Hostel & Food (per year)</span>
                            </div>
                            <span className="text-md font-bold text-orange-700">
                              {formatCurrency(course.hostel_food_fee || 0)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Course Details */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCapIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700 font-medium text-sm">Course Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="font-medium">{course.duration_years} Years</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Serial Number</p>
                            <p className="font-medium">#{course.slno || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    onClick={() => toggleCourseExpansion(course.id)}
                    variant="outline"
                    className="w-full text-teal-700 hover:bg-teal-50"
                  >
                    {expandedCourseIds.has(course.id) ? (
                      <>
                        <ChevronUpIcon className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="h-4 w-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="text-lg text-gray-600 mt-4">No courses available for this college</p>
            <p className="text-sm text-gray-500">
              Check back later for course offerings
            </p>
          </div>
        )}
      </div>


    </div>
  );
}
