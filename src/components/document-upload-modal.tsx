"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentList } from "@/components/document-list";
import { FileUp } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { APPLICATION_STATUS } from "@/utils/application-status";

interface DocumentUploadModalProps {
  applicationId: string;
  applicationStatus: string;
  trigger?: React.ReactNode;
}

export function DocumentUploadModal({
  applicationId,
  applicationStatus,
  trigger
}: DocumentUploadModalProps) {
  const [open, setOpen] = useState(false);
  const { userRole } = useUserRole();
  const isAgent = userRole === "agent";

  // Determine if the user can upload documents based on role and application status
  const canUploadDocuments = (isAgent || applicationStatus === APPLICATION_STATUS.VERIFIED) &&
                            applicationStatus !== APPLICATION_STATUS.COMPLETED;

  // Check if the application is already marked as documents uploaded or completed
  const isDocumentsUploaded = applicationStatus === APPLICATION_STATUS.DOCUMENTS_UPLOADED;
  const isCompleted = applicationStatus === APPLICATION_STATUS.COMPLETED;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          >
            <FileUp className="h-4 w-4 mr-1" />
            Upload Docs
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload and manage documents for this application
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Document list section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Uploaded Documents</h3>
            <DocumentList
              applicationId={applicationId}
              applicationStatus={applicationStatus}
            />
          </div>

          {/* Document upload section - only show if user can upload documents */}
          {canUploadDocuments && !isCompleted && (
            <div className="pt-4 border-t">
              <DocumentUpload
                applicationId={applicationId}
                applicationStatus={applicationStatus}
                onDocumentUploaded={() => setOpen(true)}
              />
            </div>
          )}

          {/* Show message if user can't upload documents */}
          {(!canUploadDocuments || isCompleted) && (
            <div className="pt-4 border-t">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                {isCompleted
                  ? "This application is completed. Documents cannot be modified."
                  : isDocumentsUploaded
                    ? "Documents have already been uploaded. Contact an agent to make changes."
                    : "You don't have permission to upload documents for this application."}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
