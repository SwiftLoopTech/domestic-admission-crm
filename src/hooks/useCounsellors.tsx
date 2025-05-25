"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCounsellors, createCounsellor, updateCounsellor, deleteCounsellor, CounsellorInput } from "@/services/counsellors";
import { toast } from "sonner";

export function useCounsellors() {
  const queryClient = useQueryClient();

  // Query for fetching counsellors
  const {
    data: counsellors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["counsellors"],
    queryFn: getCounsellors,
  });

  // Mutation for creating a counsellor
  const { mutate: createCounsellorMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: CounsellorInput) => createCounsellor(data),
    onSuccess: (newCounsellor) => {
      // Optimistically update the cache
      queryClient.setQueryData(["counsellors"], (oldData: any) => {
        return [...(oldData || []), newCounsellor];
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["counsellors"] });

      // Show success message
      toast.success("Counsellor created successfully", {
        style: { backgroundColor: '#10B981', color: 'white' },
      });
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(`Failed to create counsellor: ${error.message}`, {
        style: { backgroundColor: '#991B1B', color: 'white' },
        icon: '❌'
      });
    },
  });

  // Mutation for updating a counsellor
  const { mutate: updateCounsellorMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CounsellorInput> }) => 
      updateCounsellor(id, data),
    onSuccess: (updatedCounsellor) => {
      // Update the cache
      queryClient.setQueryData(["counsellors"], (oldData: any) => {
        return (oldData || []).map((counsellor: any) =>
          counsellor.id === updatedCounsellor.id ? updatedCounsellor : counsellor
        );
      });

      // Show success message
      toast.success("Counsellor updated successfully", {
        style: { backgroundColor: '#10B981', color: 'white' },
      });
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(`Failed to update counsellor: ${error.message}`, {
        style: { backgroundColor: '#991B1B', color: 'white' },
        icon: '❌'
      });
    },
  });

  // Mutation for deleting a counsellor
  const { mutate: deleteCounsellorMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => deleteCounsellor(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData(["counsellors"], (oldData: any) => {
        return (oldData || []).filter((counsellor: any) => counsellor.id !== deletedId);
      });

      // Show success message
      toast.success("Counsellor deleted successfully", {
        style: { backgroundColor: '#991B1B', color: 'white' },
        icon: '🗑️'
      });
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(`Failed to delete counsellor: ${error.message}`, {
        style: { backgroundColor: '#991B1B', color: 'white' },
        icon: '❌'
      });
    },
  });

  return {
    counsellors,
    isLoading,
    error: error as Error | null,
    refetch,
    createCounsellor: createCounsellorMutation,
    isCreating,
    updateCounsellor: updateCounsellorMutation,
    isUpdating,
    deleteCounsellor: deleteCounsellorMutation,
    isDeleting,
  };
}
