"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Edit, X } from "lucide-react";
import { supabase } from "@/utils/supabase";

interface NotesEditorProps {
  applicationId: string;
  initialNotes: string | null;
  onNotesUpdated?: () => void;
  isReadOnly?: boolean;
}

export function NotesEditor({
  applicationId,
  initialNotes,
  onNotesUpdated,
  isReadOnly = false
}: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalNotes, setOriginalNotes] = useState(initialNotes || "");

  // Update local state when initialNotes changes
  useEffect(() => {
    setNotes(initialNotes || "");
    setOriginalNotes(initialNotes || "");
  }, [initialNotes]);

  const handleSaveNotes = async () => {
    if (notes === originalNotes) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('applications')
        .update({
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success("Notes updated successfully");
      setOriginalNotes(notes);
      setIsEditing(false);

      if (onNotesUpdated) {
        onNotesUpdated();
      }
    } catch (error: any) {
      console.error("Error updating notes:", error);
      toast.error(`Failed to update notes: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotes(originalNotes);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Notes</CardTitle>
          {!isEditing && !isReadOnly ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Notes
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          Additional information about this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this application..."
            className="min-h-[120px]"
          />
        ) : (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[40px]">
            {notes || "No notes added yet."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
