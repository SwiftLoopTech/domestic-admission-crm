"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCommissions } from "@/hooks/useCommissions";
import { useUserRole } from "@/hooks/useUserRole";
import {
  COMMISSION_STATUS_COLORS,
  COMMISSION_STATUS_WORKFLOW,
  COMMISSION_PAYMENT_STATUS
} from "@/utils/commission-status";

interface CommissionStatusDropdownProps {
  commissionId: string;
  currentStatus: string;
}

export function CommissionStatusDropdown({
  commissionId,
  currentStatus
}: CommissionStatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const { updateStatus, isUpdatingStatus } = useCommissions();
  const { userRole } = useUserRole();

  // Only agents can update commission status
  const isAgent = userRole === "agent";

  // Get available statuses based on role
  const availableStatuses = isAgent
    ? COMMISSION_STATUS_WORKFLOW[currentStatus] || []
    : [];

  // Only disable the dropdown if updating or if there are no available transitions
  // or if the user is not an agent
  const isDisabled = isUpdatingStatus || availableStatuses.length === 0 || !isAgent;

  // Function to handle status change click
  const handleStatusClick = (newStatus: string) => {
    // Proceed with status change
    updateStatus({
      commissionId,
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between",
            COMMISSION_STATUS_COLORS[currentStatus],
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={isDisabled}
        >
          <span>{currentStatus}</span>
          {isUpdatingStatus ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {availableStatuses.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusClick(status)}
            className={cn(
              "cursor-pointer flex items-center justify-between",
              currentStatus === status && "font-medium"
            )}
          >
            <span>{status}</span>
            {currentStatus === status && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
