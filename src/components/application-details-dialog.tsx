"use client";

import { useState, useEffect } from "react";
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
import { useApplications } from "@/hooks/useApplications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const { updateApplication, isUpdatingApplication } = useApplications();
  const isAgent = userRole === "agent";

  // State for editable fields
  const [currentApplication, setCurrentApplication] = useState<Application>(application);

  // Editing states
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isEditingCollege, setIsEditingCollege] = useState(false);

  // Check if application is completed (no edits allowed)
  const isCompleted = currentApplication.application_status === 'Completed';

  // Form states
  const [studentName, setStudentName] = useState(application.student_name);
  const [email, setEmail] = useState(application.email);
  const [phone, setPhone] = useState(application.phone);
  const [preferredCollege, setPreferredCollege] = useState(application.preferred_college);
  const [preferredCourse, setPreferredCourse] = useState(application.preferred_course);

  // Reset form values when application changes
  useEffect(() => {
    setCurrentApplication(application);
    setStudentName(application.student_name);
    setEmail(application.email);
    setPhone(application.phone);
    setPreferredCollege(application.preferred_college);
    setPreferredCourse(application.preferred_course);
  }, [application]);

  // Handle saving student details
  const handleSaveStudentDetails = () => {
    if (!isAgent || isCompleted) {
      toast.error(isCompleted ? "Completed applications cannot be edited" : "Only Partners can edit student details");
      return;
    }

    updateApplication({
      applicationId: application.id,
      data: {
        student_name: studentName,
        email: email,
        phone: phone
      }
    });

    // Update local state
    setCurrentApplication({
      ...currentApplication,
      student_name: studentName,
      email: email,
      phone: phone
    });

    setIsEditingStudent(false);
    toast.success("Student details updated successfully");
  };

  // Handle saving college information
  const handleSaveCollegeInfo = () => {
    if (!isAgent || isCompleted) {
      toast.error(isCompleted ? "Completed applications cannot be edited" : "Only Partners can edit college information");
      return;
    }

    updateApplication({
      applicationId: application.id,
      data: {
        preferred_college: preferredCollege,
        preferred_course: preferredCourse
      }
    });

    // Update local state
    setCurrentApplication({
      ...currentApplication,
      preferred_college: preferredCollege,
      preferred_course: preferredCourse
    });

    setIsEditingCollege(false);
    toast.success("College information updated successfully");
  };

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
              <div className="flex justify-between items-center">
                <CardTitle>Student Information</CardTitle>
                {isAgent && !isEditingStudent && !isCompleted ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingStudent(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : isEditingStudent ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingStudent(false)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveStudentDetails}
                      disabled={isUpdatingApplication}
                    >
                      {isUpdatingApplication ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isEditingStudent ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <Input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                      type="email"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{currentApplication.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{currentApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{currentApplication.phone}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* College information */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>College Information</CardTitle>
                {isAgent && !isEditingCollege && !isCompleted ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingCollege(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : isEditingCollege ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingCollege(false)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveCollegeInfo}
                      disabled={isUpdatingApplication}
                    >
                      {isUpdatingApplication ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isEditingCollege ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Preferred College</p>
                    <Input
                      value={preferredCollege}
                      onChange={(e) => setPreferredCollege(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Preferred Course</p>
                    <Input
                      value={preferredCourse}
                      onChange={(e) => setPreferredCourse(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Preferred College</p>
                    <p className="text-sm text-muted-foreground">{currentApplication.preferred_college}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Preferred Course</p>
                    <p className="text-sm text-muted-foreground">{currentApplication.preferred_course}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes section */}
          <NotesEditor
            applicationId={application.id}
            initialNotes={application.notes}
            onNotesUpdated={() => setOpen(true)}
            isReadOnly={isCompleted}
          />

          {/* Documents section - always show document list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {isCompleted
                  ? 'Application is completed. Documents cannot be modified.'
                  : 'View and manage documents for this application'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Always show the document list */}
              <DocumentList
                applicationId={application.id}
                applicationStatus={currentApplication.application_status}
              />

              {/* Show upload functionality if status is Verified or if agent and status is Documents Uploaded */}
              {!isCompleted && (application.application_status === 'Verified' ||
                (isAgent && application.application_status === 'Documents Uploaded')) && (
                <div className="pt-4 border-t">
                  <DocumentUpload
                    applicationId={application.id}
                    applicationStatus={currentApplication.application_status}
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
