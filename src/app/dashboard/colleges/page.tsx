
"use client"

import { useState, useEffect } from "react";
import { useColleges, useDeleteCollege } from "@/hooks/useColleges";
import { useCounsellorColleges, useCounsellorCollegeSearch } from "@/hooks/useCounsellorColleges";
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
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
// import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { CollegeCard } from "@/components/colleges/college-card"
import { useUserRole } from "@/hooks/useUserRole"
import { Skeleton } from "@/components/ui/skeleton";

type College = Database['public']['Tables']['colleges']['Row'];

export default function CollegesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3x3 grid

  const { userRole } = useUserRole();
  const isAgent = userRole === "agent";
  const isCounsellor = userRole === "counsellor";

  // Use different hooks based on user role
  const agentCollegesQuery = useColleges({
    searchTerm: debouncedSearchTerm,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize
  });

  const counsellorCollegesQuery = useCounsellorColleges();
  const counsellorSearchQuery = useCounsellorCollegeSearch(debouncedSearchTerm, isCounsellor && debouncedSearchTerm.length > 0);

  // Select the appropriate data based on user role
  const data = isCounsellor ?
    {
      colleges: debouncedSearchTerm.length > 0 ? counsellorSearchQuery.colleges : counsellorCollegesQuery.colleges,
      total: debouncedSearchTerm.length > 0 ? counsellorSearchQuery.colleges.length : counsellorCollegesQuery.colleges.length
    } :
    agentCollegesQuery.data;

  const isLoading = isCounsellor ?
    (debouncedSearchTerm.length > 0 ? counsellorSearchQuery.isLoading : counsellorCollegesQuery.isLoading) :
    agentCollegesQuery.isLoading;

  const deleteCollegeMutation = useDeleteCollege();

  // Debounce search term to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
            <p className="text-white/60 text-sm">
              {isCounsellor ? "Explore available institutions" : "Manage and explore partner institutions"}
            </p>
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
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search colleges by name or location..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Exact match toggle removed */}
      </div>

      {/* Colleges Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center justify-center">
              <Skeleton className="w-full h-72 rounded-lg bg-zinc-400" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.colleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                onDelete={() => handleDelete(college.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.total && data.total > 0 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, data.total)} of {data.total} colleges
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!data || !data.total || currentPage * pageSize >= data.total}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
