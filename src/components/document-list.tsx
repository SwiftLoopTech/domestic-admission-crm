"use client";

import { useState, useEffect } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { Button } from "@/components/ui/button";

interface DocumentListProps {
  applicationId: string;
}

export function DocumentList({ applicationId }: DocumentListProps) {
  const [documentLinks, setDocumentLinks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open(link, '_blank')}
              className="flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
