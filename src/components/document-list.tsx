"use client";

import { useState, useEffect } from "react";
import { ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useApplications } from "@/hooks/useApplications";

interface DocumentListProps {
  applicationId: string;
  applicationStatus: string;
}

export function DocumentList({ applicationId, applicationStatus }: DocumentListProps) {
  const [documentLinks, setDocumentLinks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useUserRole();
  const { updateApplication, isUpdatingApplication } = useApplications();

  // Determine if the user can delete documents
  const isAgent = userRole === "agent";
  const canDeleteDocuments = isAgent || applicationStatus === "Verified";

  useEffect(() => {
    async function fetchDocumentLinks() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('applications')
          .select('document_links')
          .eq('id', applicationId)
          .single();

        if (error) throw error;

        if (data && data.document_links) {
          setDocumentLinks(data.document_links);
        }
      } catch (error) {
        console.error("Error fetching document links:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocumentLinks();
  }, [applicationId]);

  // Function to get file name from URL
  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch (e) {
      // If URL parsing fails, return the last part of the URL
      const parts = url.split('/');
      return parts[parts.length - 1];
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading documents...</span>
      </div>
    );
  }

  if (documentLinks.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-muted/50">
        <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
      </div>
    );
  }

  // Function to handle document deletion
  const handleDeleteDocument = async (linkToDelete: string) => {
    if (!canDeleteDocuments) {
      toast.error("You don't have permission to delete documents");
      return;
    }

    try {
      // Filter out the document to delete
      const updatedLinks = documentLinks.filter(link => link !== linkToDelete);

      // Update the application with the new document links
      updateApplication({
        applicationId,
        data: { document_links: updatedLinks }
      });

      // Update local state
      setDocumentLinks(updatedLinks);

      // Show success message
      toast.success("Document deleted successfully", {
        style: { backgroundColor: "#ef4444", color: "white" }
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(`Failed to delete document: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Uploaded Documents</h3>
      <div className="grid gap-2">
        {documentLinks.map((link, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="h-5 w-5 flex-shrink-0 text-blue-500" />
              <span className="text-sm truncate">{getFileName(link)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(link, '_blank')}
                className="flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>

              {canDeleteDocuments && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument(link)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isUpdatingApplication}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
