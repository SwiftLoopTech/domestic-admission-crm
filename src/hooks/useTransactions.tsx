"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTransactions, updateTransactionStatus, updateTransaction, createTransaction } from "@/services/transactions";
import { toast } from "sonner";
import { isValidTransactionStatusTransition } from "@/utils/transaction-status";
import { useUserRole } from "@/hooks/useUserRole";

interface TransactionInput {
  application_id: string;
  student_name: string;
  amount: number;
  subagent_id?: string | null;
  description?: string;
  notes?: string;
}

interface TransactionUpdateInput {
  notes?: string;
}

export function useTransactions() {
  const queryClient = useQueryClient();
  const { userRole } = useUserRole();

  // Query for fetching transactions
  const {
    data: transactions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  // Mutation for creating a transaction
  const { mutate: createTransactionMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: TransactionInput) => createTransaction(data),
    onSuccess: (newTransaction) => {
      // Optimistically update the cache
      queryClient.setQueryData(["transactions"], (oldData: any) => {
        return [...(oldData || []), newTransaction];
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      // Show success message
      toast.success("Transaction created successfully");
    },
    onError: (error: Error) => {
      console.error("Error creating transaction:", error);
      toast.error(`Failed to create transaction: ${error.message}`);
    },
  });

  // Mutation for updating transaction status
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({
      transactionId,
      newStatus,
    }: {
      transactionId: string;
      newStatus: string;
    }) => updateTransactionStatus({ transactionId, newStatus }),
    onSuccess: (updatedTransaction) => {
      // Optimistically update the cache
      queryClient.setQueryData(["transactions"], (oldData: any) => {
        return oldData.map((transaction: any) =>
          transaction.id === updatedTransaction.id
            ? updatedTransaction
            : transaction
        );
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      // Show success message
      toast.success(`Transaction status updated to ${updatedTransaction.transaction_status}`);
    },
    onError: (error: Error) => {
      console.error("Error updating transaction status:", error);
      toast.error(`Failed to update transaction status: ${error.message}`);
    },
  });

  // Mutation for updating transaction notes
  const { mutate: updateTransactionMutation, isPending: isUpdatingTransaction } = useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: TransactionUpdateInput;
    }) => updateTransaction(transactionId, data),
    onSuccess: (updatedTransaction) => {
      // Optimistically update the cache
      queryClient.setQueryData(["transactions"], (oldData: any) => {
        return oldData.map((transaction: any) =>
          transaction.id === updatedTransaction.id
            ? updatedTransaction
            : transaction
        );
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      // Show success message
      toast.success("Transaction updated successfully");
    },
    onError: (error: Error) => {
      console.error("Error updating transaction:", error);
      toast.error(`Failed to update transaction: ${error.message}`);
    },
  });

  return {
    transactions,
    isLoading,
    error,
    refetch,
    createTransaction: createTransactionMutation,
    isCreating,
    updateStatus,
    isUpdatingStatus,
    updateTransaction: updateTransactionMutation,
    isUpdatingTransaction,
  };
}
