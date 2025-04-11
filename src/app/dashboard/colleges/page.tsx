"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddCollegeModal } from "@/components/colleges/add-college-modal"
import { 
  ExternalLinkIcon, 
  FileIcon, 
  MapPinIcon, 
  BookOpenIcon,
  BuildingIcon,
  SearchIcon 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Define college type
interface College {
  id: string
  name: string
  location: string
  website: string
  brochureUrl?: string
}

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([
    {
      id: "1",
      name: "Massachusetts Institute of Technology",
      location: "Cambridge, MA",
      website: "https://mit.edu",
      brochureUrl: "#"
    },
    // Add more colleges as needed
  ])

  const [searchTerm, setSearchTerm] = useState("")

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCollege = (collegeData: {
    name: string
    location: string
    website: string
    brochureFile: File | null
  }) => {
    const newCollege: College = {
      id: Date.now().toString(),
      name: collegeData.name,
      location: collegeData.location,
      website: collegeData.website,
      brochureUrl: collegeData.brochureFile ? "#" : undefined
    }

    setColleges([...colleges, newCollege])
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BuildingIcon className="h-6 w-6" />
              Colleges Directory
            </h1>
            <p className="text-teal-50">Manage and explore partner institutions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <AddCollegeModal onAddCollege={handleAddCollege} />
            <Link href="/dashboard/colleges/courses">
              <Button 
                variant="outline" 
                className="bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700 w-full sm:w-auto"
              >
                <BookOpenIcon className="mr-2 h-4 w-4" />
                Manage Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search colleges by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredColleges.map((college) => (
          <Card key={college.id} className="group hover:shadow-lg transition-shadow duration-200 border">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-200">
                  Partner Institution
                </Badge>
              </div>
              <CardTitle className="flex items-center text-xl">
                <BuildingIcon className="h-6 w-6 mr-2 text-teal-600" />
                {college.name}
              </CardTitle>
              <CardDescription className="flex items-center text-base">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                {college.location}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 hover:underline"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Visit Website
              </a>
            </CardContent>

            <CardFooter className="pt-4 flex gap-2">
              {college.brochureUrl && (
                <Button 
                  variant="outline" 
                  className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <FileIcon className="h-4 w-4 mr-2" />
                  Download Brochure
                </Button>
              )}
              <Link href="/dashboard/colleges/courses" className="flex-1">
                <Button 
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
                >
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  View Courses
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
