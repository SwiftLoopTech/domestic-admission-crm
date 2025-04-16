"use client";

import { useState } from "react";

import { useApplications } from "@/hooks/useApplications";
import { useSubagentNames } from "@/hooks/useSubagentNames";
import { useUserRole } from "@/hooks/useUserRole";
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
import { ApplicationDetailsDialog } from "@/components/application-details-dialog";
import { ApplicationStatusDropdown } from "@/components/application-status-dropdown";
import { DocumentUploadModal } from "@/components/document-upload-modal";
import { APPLICATION_STATUS } from "@/utils/application-status";

export default function ApplicationsPage() {
  const { applications, isLoading: isLoadingApplications, error: applicationsError } = useApplications();
  const { getSubagentName, isLoading: isLoadingSubagents, error: subagentsError } = useSubagentNames();
  const { userRole } = useUserRole();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Check if user is a subagent
  const isSubagent = userRole === "sub-agent";

  // Combined loading and error states
  const isLoading = isLoadingApplications || isLoadingSubagents;
  const error = applicationsError || subagentsError;

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
      <div className="flex justify-between items-center mb-14">
        <h1 className="text-3xl font-medium">Applications</h1>
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
            <TableRow className="text-zinc-600 font-light !border-b-0">
              <TableHead>Student Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              {!isSubagent && <TableHead>Subagent</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application.id} className="border-b-0">
                <TableCell className="font-medium">{application.student_name}</TableCell>
                <TableCell className="text-zinc-800">{application.phone}</TableCell>
                <TableCell className="text-zinc-800">{application.preferred_college}</TableCell>
                <TableCell className="text-zinc-800">{application.preferred_course}</TableCell>
                <TableCell className="min-w-[200px] text-black">
                  <ApplicationStatusDropdown
                    applicationId={application.id}
                    currentStatus={application.application_status}
                  />
                </TableCell>
                {!isSubagent && (
                  <TableCell className="text-zinc-800">
                    {getSubagentName(application.subagent_id)}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Show upload documents button for verified applications */}
                    {application.application_status === APPLICATION_STATUS.VERIFIED &&
                     (userRole === "agent" || userRole === "sub-agent") && (
                      <DocumentUploadModal
                        applicationId={application.id}
                        applicationStatus={application.application_status}
                      />

                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <ApplicationDetailsDialog
                          application={application}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              View details
                            </DropdownMenuItem>
                          }
                        />
                        {application.application_status === APPLICATION_STATUS.VERIFIED &&
                         (userRole === "agent" || userRole === "sub-agent") && (
                          <DocumentUploadModal
                            applicationId={application.id}
                            applicationStatus={application.application_status}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Upload documents
                              </DropdownMenuItem>
                            }
                          />
                        )}
                        <DropdownMenuSeparator />
                        { !isSubagent && (
                        <DropdownMenuItem className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                    )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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