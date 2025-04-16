
"use client"

import { useState } from "react";
import { useColleges, useDeleteCollege } from "@/hooks/useColleges";
import { Database } from "@/types/supabase";
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
import { CollegeCard } from "@/components/colleges/college-card"
import { useUserRole } from "@/hooks/useUserRole"

type College = Database['public']['Tables']['colleges']['Row'];

export default function CollegesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useColleges({ searchTerm });
  const deleteCollegeMutation = useDeleteCollege();
  const { userRole } = useUserRole();
  const isAgent = userRole === "agent";

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCollegeMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting college:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#222B38] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-white flex items-center gap-2">
              Colleges Directory
            </h1>
            <p className="text-white/60 text-sm">Manage and explore partner institutions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {isAgent && <AddCollegeModal />}
            {isAgent && (
              <Link href="/dashboard/colleges/courses">
                <Button
                  variant="outline"
                  className="bg-white text-black w-full sm:w-auto"
                >
                  <BookOpenIcon className="mr-2 h-4 w-4" />
                  Manage Courses
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search colleges by name or location..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Colleges Grid */}
      {isLoading ? (
        <div>@noel: add a skeleton here</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.colleges.map((college) => (
            <CollegeCard
              key={college.id}
              college={college}
              onDelete={() => handleDelete(college.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
