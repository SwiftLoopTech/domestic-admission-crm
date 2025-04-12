"use client";

// This component is a merger of the original DocumentUpload and CustomDocumentUpload components
// It provides the ability to create custom document fields and upload documents

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Upload,
  Check,
  X,
  FileText,
  Plus,
  Trash2
} from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { APPLICATION_STATUS } from "@/utils/application-status";
import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { useUserRole } from "@/hooks/useUserRole";

interface DocumentUploadProps {
  applicationId: string;
  onDocumentUploaded?: () => void;
}

interface DocumentField {
  id: string;
  name: string;
  file?: File;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

export function DocumentUpload({
  applicationId,
  onDocumentUploaded
}: DocumentUploadProps) {
  const [documentFields, setDocumentFields] = useState<DocumentField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [isAddingField, setIsAddingField] = useState(false);
  const [documentLinks, setDocumentLinks] = useState<string[]>([]);
  const { updateStatus, isUpdatingStatus } = useApplications();
  const { userRole } = useUserRole();
  const isAgent = userRole === "agent";

  // Fetch existing document links when component mounts
  useEffect(() => {
    async function fetchDocumentLinks() {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('document_links, application_status')
          .eq('id', applicationId)
          .single();

        if (error) throw error;

        if (data) {
          // Check if documents can be uploaded based on status
          if (data.application_status !== 'Verified' && 
              data.application_status !== 'processing' && 
              !(isAgent && data.application_status === 'Documents Uploaded')) {
            toast.info("Documents can only be uploaded when application is in Verified status");
          }

          // Set document links
          if (data.document_links) {
            setDocumentLinks(data.document_links);

            // Try to extract document names from links
            const extractedFields: DocumentField[] = data.document_links.map((link: string) => {
              // Try to extract document name from the URL
              const urlParts = link.split('/');
              const fileName = urlParts[urlParts.length - 1];
              const docName = fileName.split('_')[0] || 'Document';

              return {
                id: uuidv4(),
                name: docName,
                uploading: false,
                uploaded: true,
                url: link
              };
            });

            setDocumentFields(extractedFields);
          }
        }
      } catch (error) {
        console.error("Error fetching document links:", error);
      }
    }

    fetchDocumentLinks();
  }, [applicationId, isAgent]);

  const addDocumentField = () => {
    if (!newFieldName.trim()) {
      toast.error("Please enter a document name");
      return;
    }

    const newField: DocumentField = {
      id: uuidv4(),
      name: newFieldName.trim(),
      uploading: false,
      uploaded: false
    };

    setDocumentFields([...documentFields, newField]);
    setNewFieldName("");
    setIsAddingField(false);
    toast.success(`Added ${newFieldName} document field`);
  };

  const removeDocumentField = (id: string) => {
    setDocumentFields(documentFields.filter(field => field.id !== id));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Update the field with the selected file
    setDocumentFields(fields =>
      fields.map(field =>
        field.id === fieldId
          ? { ...field, file, uploading: false, uploaded: false }
          : field
      )
    );
  };

  const uploadDocument = async (fieldId: string) => {
    const field = documentFields.find(f => f.id === fieldId);
    if (!field || !field.file) {
      toast.error("No file selected");
      return;
    }

    // Set uploading state
    setDocumentFields(fields =>
      fields.map(f =>
        f.id === fieldId ? { ...f, uploading: true } : f
      )
    );

    try {
      // Generate a unique file name to avoid collisions
      const fileExt = field.file.name.split('.').pop();
      const fileName = `${field.name}_${uuidv4()}.${fileExt}`;
      const filePath = `${applicationId}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(filePath, field.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('application-documents')
        .getPublicUrl(filePath);

      // First, get the current document_links array
      const { data: currentData, error: fetchError } = await supabase
        .from('applications')
        .select('document_links')
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Create a new array with the new URL appended
      const updatedLinks = [...(currentData.document_links || []), publicUrl];

      // Update the application with the new document_links array
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          document_links: updatedLinks,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Update local state
      setDocumentLinks(prev => [...prev, publicUrl]);
      setDocumentFields(fields =>
        fields.map(f =>
          f.id === fieldId
            ? { ...f, uploading: false, uploaded: true, url: publicUrl }
            : f
        )
      );

      toast.success(`${field.name} uploaded successfully`);

      // Call the callback if provided
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (error: any) {
      toast.error(`Failed to upload ${field.name}: ${error.message}`);
      console.error("Upload error:", error);

      // Reset uploading state
      setDocumentFields(fields =>
        fields.map(f =>
          f.id === fieldId ? { ...f, uploading: false } : f
        )
      );
    }
  };

  const handleCompleteDocuments = async () => {
    try {
      await updateStatus({
        applicationId,
        newStatus: APPLICATION_STATUS.DOCUMENTS_UPLOADED
      });

      toast.success("Application status updated to Documents Uploaded");
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  // Check if any documents have been uploaded
  const hasUploadedDocuments = documentFields.some(field => field.uploaded);

  return (
    <div className="space-y-4">
      {/* Document fields */}
      <div className="space-y-4">
        {documentFields.map(field => (
          <div key={field.id} className="border rounded-md p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">{field.name}</div>
              {!field.uploaded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocumentField(field.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>

            {field.uploaded ? (
              <div className="flex items-center text-sm text-green-600">
                <Check className="h-4 w-4 mr-1" />
                Document uploaded
                {field.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => window.open(field.url, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  id={`file-${field.id}`}
                  onChange={(e) => handleFileChange(e, field.id)}
                  disabled={field.uploading}
                  className="flex-1"
                />
                <Button
                  onClick={() => uploadDocument(field.id)}
                  disabled={!field.file || field.uploading}
                  size="sm"
                >
                  {field.uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Upload className="h-4 w-4 mr-1" />
                  )}
                  Upload
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new document field */}
      {isAddingField ? (
        <div className="border rounded-md p-4 space-y-2">
          <Label htmlFor="new-field-name">Document Name</Label>
          <div className="flex items-center gap-2">
            <Input
              id="new-field-name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Enter document name"
              className="flex-1"
            />
            <Button onClick={addDocumentField} size="sm">
              <Check className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAddingField(false);
                setNewFieldName("");
              }}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAddingField(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Document Field
        </Button>
      )}

      {/* Mark documents as complete button */}
      {hasUploadedDocuments && (
        <Button
          onClick={handleCompleteDocuments}
          disabled={isUpdatingStatus}
          className="w-full"
        >
          {isUpdatingStatus ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Status...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Mark Documents as Complete
            </>
          )}
        </Button>
      )}
    </div>
  );
}
