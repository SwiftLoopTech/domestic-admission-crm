"use client";

import { useState } from "react";
import { format } from "date-fns";

import { useApplications } from "@/hooks/useApplications";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { ApplicationModal } from "@/components/application-modal";
import { Badge } from "@/components/ui/badge";

// Define application status colors
const statusColors: Record<string, string> = {
  "Pending": "bg-yellow-500",
  "Approved": "bg-green-500",
  "Rejected": "bg-red-500",
  "In Progress": "bg-blue-500",
  "Completed": "bg-purple-500",
};

export default function ApplicationsPage() {
  const { applications, isLoading, error } = useApplications();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Filter applications by status if a status is selected
  const filteredApplications = selectedStatus
    ? applications.filter(app => app.application_status === selectedStatus)
    : applications;

  // Get unique statuses for the filter
  const statuses = [...new Set(applications.map(app => app.application_status))];

  if (isLoading) {
    return <ApplicationsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="flex gap-4">
          {/* Status filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedStatus || "Filter by Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedStatus(null)}>
                All
              </DropdownMenuItem>
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Application Modal */}
          <ApplicationModal />
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No applications found. Add your first application to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.student_name}</TableCell>
                <TableCell>{application.email}</TableCell>
                <TableCell>{application.phone}</TableCell>
                <TableCell>{application.preferred_college}</TableCell>
                <TableCell>{application.preferred_course}</TableCell>
                <TableCell>
                  <Badge className={statusColors[application.application_status] || "bg-gray-500"}>
                    {application.application_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {application.created_at
                    ? format(new Date(application.created_at), "MMM d, yyyy")
                    : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

// Loading skeleton
function ApplicationsPageSkeleton() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            <TableHead><Skeleton className="h-4 w-20" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}