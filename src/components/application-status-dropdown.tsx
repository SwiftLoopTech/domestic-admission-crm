"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmStatusDialog } from "@/components/confirm-status-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useApplications } from "@/hooks/useApplications";
import { useUserRole } from "@/hooks/useUserRole";
import {
  STATUS_COLORS,
  STATUS_WORKFLOW,
  AGENT_STATUS_WORKFLOW,
  APPLICATION_STATUS
} from "@/utils/application-status";

interface ApplicationStatusDropdownProps {
  applicationId: string;
  currentStatus: string;
}

export function ApplicationStatusDropdown({
  applicationId,
  currentStatus
}: ApplicationStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    statusToConfirm: ""
  });
  const { updateStatus, isUpdatingStatus } = useApplications();
  const { userRole } = useUserRole();

  // Determine if user is an agent
  const isAgent = userRole === "agent";

  // Get available statuses based on role
  const availableStatuses = isAgent
    ? AGENT_STATUS_WORKFLOW[currentStatus] || []
    : STATUS_WORKFLOW[currentStatus] || [];

  // Log for debugging
  console.log('Current status:', currentStatus);
  console.log('User role:', userRole);
  console.log('Is agent:', isAgent);
  console.log('Available statuses:', availableStatuses);

  // Log available statuses based on role
  console.log('Available statuses based on role:', availableStatuses);

  // Only disable the dropdown if updating or if it's a completed/rejected application with no transitions
  const isDisabled = isUpdatingStatus ||
    (availableStatuses.length === 0 &&
     (currentStatus === "Completed" || currentStatus === "Rejected"));

  // Function to handle status change click
  const handleStatusClick = (newStatus: string) => {
    // Check if we need confirmation for this status change
    const needsConfirmation = [
      APPLICATION_STATUS.DOCUMENTS_UPLOADED,
      APPLICATION_STATUS.REJECTED,
      APPLICATION_STATUS.COMPLETED
    ].includes(newStatus);

    if (needsConfirmation) {
      // Show confirmation dialog
      setConfirmDialog({
        isOpen: true,
        statusToConfirm: newStatus
      });
      setOpen(false); // Close the dropdown
    } else {
      // Proceed with status change directly
      executeStatusChange(newStatus);
    }
  };

  // Function to execute the actual status change
  const executeStatusChange = (newStatus: string) => {
    console.log('Executing status change to:', newStatus);
    updateStatus({
      applicationId,
      newStatus
    }, {
      onSuccess: (data) => {
        console.log('Status update successful:', data);
        toast.success(`Status updated to ${newStatus}`);
        setOpen(false);
      },
      onError: (error) => {
        console.error('Status update failed:', error);
        toast.error(`Failed to update status: ${error.message}`);
      }
    });
  };

  // Handle confirmation dialog close
  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      isOpen: false,
      statusToConfirm: ""
    });
  };

  // Handle confirmation dialog confirm
  const handleConfirmDialogConfirm = () => {
    if (confirmDialog.statusToConfirm) {
      executeStatusChange(confirmDialog.statusToConfirm);
    }
    handleConfirmDialogClose();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[180px] justify-between border border-gray-300",
            // Use appropriate color for the status
            STATUS_COLORS[currentStatus] || STATUS_COLORS["Pending"],
            "text-black font-medium hover:text-black shadow-sm cursor-pointer"
          )}
          disabled={isDisabled}
        >
          {isUpdatingStatus ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              {currentStatus}
              {!isDisabled && <ChevronDown className="ml-2 h-4 w-4 opacity-50" />}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] z-50">
        {availableStatuses.length > 0 ? (
          availableStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusClick(status)}
              className={cn(
                "cursor-pointer flex items-center p-3",
                "hover:bg-gray-100 focus:bg-gray-100"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full mr-2",
                STATUS_COLORS[status]
              )} />
              <span>{status}</span>
              {currentStatus === status && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-3 text-sm text-gray-500 text-center">
            No status changes available
          </div>
        )}
      </DropdownMenuContent>

      {/* Confirmation Dialog */}
      <ConfirmStatusDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleConfirmDialogClose}
        onConfirm={handleConfirmDialogConfirm}
        status={confirmDialog.statusToConfirm}
      />
    </DropdownMenu>
  );
}
