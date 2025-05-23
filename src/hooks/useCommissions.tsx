"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommissions, updateCommissionStatus, updateCommission, createCommission } from "@/services/commissions";
import { toast } from "sonner";
import { isValidCommissionStatusTransition } from "@/utils/commission-status";
import { useUserRole } from "@/hooks/useUserRole";

interface CommissionInput {
  application_id: string;
  transaction_id: string;
  amount: number;
  agent_id: string;
  subagent_id: string;
  notes?: string;
}

interface CommissionUpdateInput {
  amount?: number;
  notes?: string;
}

export function useCommissions() {
  const queryClient = useQueryClient();
  const { userRole } = useUserRole();

  // Query for fetching commissions
  const {
    data: commissions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["commissions"],
    queryFn: getCommissions,
  });

  // Mutation for creating a commission
  const { mutate: createCommissionMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: CommissionInput) => createCommission(data),
    onSuccess: (newCommission) => {
      // Optimistically update the cache
      queryClient.setQueryData(["commissions"], (oldData: any) => {
        return [...(oldData || []), newCommission];
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["commissions"] });

      // Show success message
      toast.success("Commission created successfully");
    },
    onError: (error: Error) => {
      console.error("Error creating commission:", error);
      toast.error(`Failed to create commission: ${error.message}`);
    },
  });

  // Mutation for updating commission status
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({
      commissionId,
      newStatus,
    }: {
      commissionId: string;
      newStatus: string;
    }) => {
      // Get the current commission to check if the status transition is valid
      const currentCommission = commissions.find((comm: any) => comm.id === commissionId);

      if (!currentCommission) {
        throw new Error("Commission not found");
      }

      // Check if the status transition is valid
      if (!isValidCommissionStatusTransition(currentCommission.payment_status, newStatus)) {
        throw new Error(`Invalid status transition from ${currentCommission.payment_status} to ${newStatus}`);
      }

      return updateCommissionStatus({ commissionId, newStatus });
    },
    onSuccess: (updatedCommission) => {
      // Optimistically update the cache
      queryClient.setQueryData(["commissions"], (oldData: any) => {
        return oldData.map((commission: any) =>
          commission.id === updatedCommission.id
            ? updatedCommission
            : commission
        );
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["commissions"] });

      // Show success message
      toast.success(`Commission status updated to ${updatedCommission.payment_status}`);
    },
    onError: (error: Error) => {
      console.error("Error updating commission status:", error);
      toast.error(`Failed to update commission status: ${error.message}`);
    },
  });

  // Mutation for updating commission details
  const { mutate: updateCommissionMutation, isPending: isUpdatingCommission } = useMutation({
    mutationFn: ({
      commissionId,
      data,
    }: {
      commissionId: string;
      data: CommissionUpdateInput;
    }) => updateCommission(commissionId, data),
    onSuccess: (updatedCommission) => {
      // Optimistically update the cache
      queryClient.setQueryData(["commissions"], (oldData: any) => {
        return oldData.map((commission: any) =>
          commission.id === updatedCommission.id
            ? updatedCommission
            : commission
        );
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["commissions"] });

      // Show success message
      toast.success("Commission updated successfully");
    },
    onError: (error: Error) => {
      console.error("Error updating commission:", error);
      toast.error(`Failed to update commission: ${error.message}`);
    },
  });

  return {
    commissions,
    isLoading,
    error,
    refetch,
    createCommission: createCommissionMutation,
    isCreating,
    updateStatus,
    isUpdatingStatus,
    updateCommission: updateCommissionMutation,
    isUpdatingCommission,
  };
}
