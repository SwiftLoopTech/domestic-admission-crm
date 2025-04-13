"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationStatusDropdown } from "@/components/application-status-dropdown";
import { STATUS_DESCRIPTIONS } from "@/utils/application-status";
import { DocumentList } from "@/components/document-list";
import { DocumentUpload } from "@/components/document-upload";
import { NotesEditor } from "@/components/notes-editor";
import { useUserRole } from "@/hooks/useUserRole";

interface Application {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  preferred_college: string;
  preferred_course: string;
  application_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  subagent_id: string | null;
  superagent_id: string | null;
}

interface ApplicationDetailsDialogProps {
  application: Application;
  trigger: React.ReactNode;
}

export function ApplicationDetailsDialog({
  application,
  trigger
}: ApplicationDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const { userRole } = useUserRole();
  const isAgent = userRole === "agent";

  // Format dates for display
  const createdAt = application.created_at
    ? format(new Date(application.created_at), "PPP p")
    : "N/A";

  const updatedAt = application.updated_at
    ? format(new Date(application.updated_at), "PPP p")
    : "N/A";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            View and manage application for {application.student_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status section */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>
                    {STATUS_DESCRIPTIONS[application.application_status] ||
                     (application.application_status === "processing" ?
                      STATUS_DESCRIPTIONS["Pending"] : "No description available")}
                  </CardDescription>
                </div>
                <ApplicationStatusDropdown
                  applicationId={application.id}
                  currentStatus={application.application_status}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Student information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{application.student_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{application.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{application.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* College information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>College Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Preferred College</p>
                  <p className="text-sm text-muted-foreground">{application.preferred_college}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Preferred Course</p>
                  <p className="text-sm text-muted-foreground">{application.preferred_course}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes - always show the notes section with ability to edit */}
          <NotesEditor
            applicationId={application.id}
            initialNotes={application.notes}
            onNotesUpdated={() => setOpen(true)}
          />

          {/* Documents section - always show document list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {(application.application_status === 'Verified' ||
                 (isAgent && application.application_status === 'Documents Uploaded'))
                  ? 'Upload required documents for this application'
                  : 'View documents for this application'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Always show the document list */}
              <DocumentList applicationId={application.id} />

              {/* Show upload functionality if status is Verified or if agent and status is Documents Uploaded */}
              {(application.application_status === 'Verified' ||
                (isAgent && application.application_status === 'Documents Uploaded')) && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Upload Documents</h3>
                  <DocumentUpload
                    applicationId={application.id}
                    onDocumentUploaded={() => setOpen(true)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{createdAt}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{updatedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
