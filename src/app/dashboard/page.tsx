"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationModal } from "@/components/application-modal";
import { useCurrentUserData } from "@/hooks/useCurrentUserData";
import { SelectContent, SelectTrigger, Select, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight, GraduationCap, SearchIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { userRole, isLoading: isLoadingRole, error: roleError } = useUserRole();
  const { user } = useCurrentUserData();
  const { name } = user || { name: "User" };
  const { stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  const isLoading = isLoadingRole || isLoadingStats;
  const error = roleError || statsError;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    console.error('Dashboard Error:', error);
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-3xl font-medium">
          Welcome, {name}!
        </h1>

        {/* Only show ApplicationModal for agents and subagents */}
        {(userRole === "agent" || userRole === "sub-agent") && <ApplicationModal />}
      </div>

      {userRole === "agent" ? (
        <div>
          <p className="mb-9 ">Welcome to the Partner dashboard.</p>
          {/* Agent-specific content */}

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select>
              <SelectTrigger className="border-zinc-400 hover:bg-zinc-200 transition focus-visible:ring-0">
                <SelectValue placeholder="Select a college" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-300">
                <SelectItem value="college1" className="hover:bg-zinc-200">College 1</SelectItem>
                <SelectItem value="college2" className="hover:bg-zinc-200">College 2</SelectItem>
                <SelectItem value="college3" className="hover:bg-zinc-200">College 3</SelectItem>
                <SelectItem value="college4" className="hover:bg-zinc-200">College 4</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="border-zinc-400 hover:bg-zinc-200 transition focus-visible:ring-0">
                <SelectValue placeholder="Associate Partner" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-300">
                <SelectItem value="college1" className="hover:bg-zinc-200">College 1</SelectItem>
                <SelectItem value="college2" className="hover:bg-zinc-200">College 2</SelectItem>
                <SelectItem value="college3" className="hover:bg-zinc-200">College 3</SelectItem>
                <SelectItem value="college4" className="hover:bg-zinc-200">College 4</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="border-zinc-400 hover:bg-zinc-200 transition focus-visible:ring-0">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-300">
                <SelectItem value="college1" className="hover:bg-zinc-200">Year 1</SelectItem>
                <SelectItem value="college2" className="hover:bg-zinc-200">Year 2</SelectItem>
                <SelectItem value="college3" className="hover:bg-zinc-200">Year 3</SelectItem>
                <SelectItem value="college4" className="hover:bg-zinc-200">Year 4</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="border-zinc-400 hover:bg-zinc-200 transition focus-visible:ring-0">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-300">
                <SelectItem value="college1" className="hover:bg-zinc-200">Kochi</SelectItem>
                <SelectItem value="college2" className="hover:bg-zinc-200">Trivandrum</SelectItem>
                <SelectItem value="college3" className="hover:bg-zinc-200">Kollam</SelectItem>
                <SelectItem value="college4" className="hover:bg-zinc-200">Calicut</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#FFC11F] hover:bg-[#FFC11F] text-black font-medium rounded-md px-6 py-4">
              Apply Filter
            </Button>
          </div>

          {/* Data tiles : Currently data is hardcoded. Need to replace data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.applicationsCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Associate Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.subagentsCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Colleges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.collegesCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Counsellors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.counsellorsCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Payments Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.paymentsCompleted}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Payments Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.paymentsPending}</p>
              </CardContent>
            </Card>

          </div>


          <div className="flex gap-5">
            <div className="w-xs mt-12">
              <div className="bg-[#FFC11F44] w-fit p-2 rounded-lg text-[#FFC11F]">
                <SearchIcon width={24} height={24} />
              </div>
              <Link href={"/dashboard/colleges"} className="text-xl mt-3 hover:underline cursor-pointer flex gap-1 items-start">Search Colleges <ChevronRight width={20} /></Link>
              <p className="text-sm mt-2 text-zinc-600">Explore colleges accepting applications through the platform. Filter courses, bulk upload courses and enrol new colleges.</p>
            </div>
            <div className="w-xs mt-12">
              <div className="bg-[#FFC11F44] w-fit p-2 rounded-lg text-[#FFC11F]">
                <GraduationCap width={24} height={24} />
              </div>
              <Link href="/dashboard/applications" className="text-xl mt-3 hover:underline cursor-pointer flex gap-1 items-start">Students<ChevronRight width={20} /></Link>
              <p className="text-sm mt-2 text-zinc-600">Explore students applying through the platform.</p>
            </div>
          </div>
        </div>
      ) : userRole === "sub-agent" ? (
        <div>
          <p className="mb-9">Welcome to the Associate Partner dashboard.</p>
          {/* Sub-agent-specific content */}
          <div className="flex gap-4 mb-6">
            <Select>
              <SelectTrigger className="border-zinc-400 hover:bg-zinc-200 transition focus-visible:ring-0">
                <SelectValue placeholder="Select a college" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-300">
                <SelectItem value="college1" className="hover:bg-zinc-200">College 1</SelectItem>
                <SelectItem value="college2" className="hover:bg-zinc-200">College 2</SelectItem>
                <SelectItem value="college3" className="hover:bg-zinc-200">College 3</SelectItem>
                <SelectItem value="college4" className="hover:bg-zinc-200">College 4</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="border-zinc-400 hover:bg-zinc-200 transition focus-visible:ring-0">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-300">
                <SelectItem value="college1" className="hover:bg-zinc-200">Year 1</SelectItem>
                <SelectItem value="college2" className="hover:bg-zinc-200">Year 2</SelectItem>
                <SelectItem value="college3" className="hover:bg-zinc-200">Year 3</SelectItem>
                <SelectItem value="college4" className="hover:bg-zinc-200">Year 4</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="border-zinc-400 hover:bg-zinc-200 transition focus-visible:ring-0">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-300">
                <SelectItem value="college1" className="hover:bg-zinc-200">Kochi</SelectItem>
                <SelectItem value="college2" className="hover:bg-zinc-200">Trivandrum</SelectItem>
                <SelectItem value="college3" className="hover:bg-zinc-200">Kollam</SelectItem>
                <SelectItem value="college4" className="hover:bg-zinc-200">Calicut</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-[#FFC11F] hover:bg-[#FFC11F] text-black font-medium rounded-md px-6 py-4">
              Apply Filter
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-medium">{stats.applicationsCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Colleges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.collegesCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Counsellors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.counsellorsCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Payments Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.paymentsCompleted}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Payments Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.paymentsPending}</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-5">
            <div className="w-xs mt-12">
              <div className="bg-[#FFC11F44] w-fit p-2 rounded-lg text-[#FFC11F]">
                <SearchIcon width={24} height={24} />
              </div>
              <h6 className="text-xl mt-3 hover:underline cursor-pointer flex gap-1 items-start">Search Collges <ChevronRight width={20} /></h6>
              <p className="text-sm mt-2 text-zinc-600">Explore colleges accepting applications through the platform. Filter courses, bulk upload courses and enrol new colleges.</p>
            </div>
            <div className="w-xs mt-12">
              <div className="bg-[#FFC11F44] w-fit p-2 rounded-lg text-[#FFC11F]">
                <GraduationCap width={24} height={24} />
              </div>
              <h6 className="text-xl mt-3 hover:underline cursor-pointer flex gap-1 items-start">Students<ChevronRight width={20} /></h6>
              <p className="text-sm mt-2 text-zinc-600">Explore students applying through the platform.</p>
            </div>
          </div>
        </div>
      ) : userRole === "counsellor" ? (
        <div>
          <p className="mb-9">Welcome to the Counsellor dashboard.</p>
          {/* Counsellor-specific content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-medium">{stats.applicationsCount}</p>
              </CardContent>
            </Card>
            <Card className="gap-3 h-fit w-2xs border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
              <CardHeader className="">
                <CardTitle className="text-sm text-zinc-700 font-medium">Colleges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-medium">{stats.collegesCount}</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-5">
            <div className="w-xs mt-12">
              <div className="bg-[#FFC11F44] w-fit p-2 rounded-lg text-[#FFC11F]">
                <SearchIcon width={24} height={24} />
              </div>
              <Link href="/dashboard/colleges" className="text-xl mt-3 hover:underline cursor-pointer flex gap-1 items-start">View Colleges <ChevronRight width={20} /></Link>
              <p className="text-sm mt-2 text-zinc-600">Explore colleges and courses available through the platform.</p>
            </div>
            <div className="w-xs mt-12">
              <div className="bg-[#FFC11F44] w-fit p-2 rounded-lg text-[#FFC11F]">
                <GraduationCap width={24} height={24} />
              </div>
              <Link href="/dashboard/applications" className="text-xl mt-3 hover:underline cursor-pointer flex gap-1 items-start">Students<ChevronRight width={20} /></Link>
              <p className="text-sm mt-2 text-zinc-600">Explore students applying through the platform.</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-64 mb-2 bg-zinc-400" />
      <Skeleton className="h-5 w-full max-w-md mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 w-2xs bg-zinc-400" />
        ))}
      </div>
    </>
  );
}