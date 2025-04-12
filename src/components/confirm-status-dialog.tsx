"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { APPLICATION_STATUS } from "@/utils/application-status";

interface ConfirmStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  status: string;
}

export function ConfirmStatusDialog({
  isOpen,
  onClose,
  onConfirm,
  status
}: ConfirmStatusDialogProps) {
  // Customize message based on status
  let title = "Confirm Status Change";
  let description = "Are you sure you want to change the status?";
  
  if (status === APPLICATION_STATUS.DOCUMENTS_UPLOADED) {
    title = "Confirm Documents Uploaded";
    description = 
      "Are you sure you want to mark documents as uploaded? " +
      "No additional documents can be uploaded after this status change " +
      "unless an agent reverts the status back to Verified.";
  } else if (status === APPLICATION_STATUS.REJECTED) {
    title = "Confirm Rejection";
    description = "Are you sure you want to reject this application?";
  } else if (status === APPLICATION_STATUS.COMPLETED) {
    title = "Confirm Completion";
    description = "Are you sure you want to mark this application as completed?";
  }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
