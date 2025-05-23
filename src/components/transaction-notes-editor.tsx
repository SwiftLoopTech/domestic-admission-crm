"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TransactionNotesEditorProps {
  transactionId: string;
  initialNotes: string | null;
}

export function TransactionNotesEditor({
  transactionId,
  initialNotes
}: TransactionNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const { updateTransaction, isUpdatingTransaction } = useTransactions();

  const handleSave = () => {
    updateTransaction({
      transactionId,
      data: { notes }
    }, {
      onSuccess: () => {
        setIsEditing(false);
        toast.success("Notes updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update notes: ${error.message}`);
      }
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this transaction..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNotes(initialNotes || "");
              setIsEditing(false);
            }}
            disabled={isUpdatingTransaction}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdatingTransaction}
          >
            {isUpdatingTransaction ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="min-h-[40px] p-2 border rounded-md bg-gray-50">
        {notes ? (
          <p className="whitespace-pre-wrap">{notes}</p>
        ) : (
          <p className="text-gray-400 italic">No notes added yet.</p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="w-full"
      >
        Edit Notes
      </Button>
    </div>
  );
}
