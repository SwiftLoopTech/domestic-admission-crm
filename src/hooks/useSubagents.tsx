"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubagents, createSubagent, SubagentInput } from "@/services/agents";
import { toast } from "sonner";

export function useSubagents() {
  const queryClient = useQueryClient();

  // Query for fetching subagents
  const {
    data: subagents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subagents"],
    queryFn: getSubagents,
  });

  // Mutation for creating a subagent
  const { mutate: createSubagentMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: SubagentInput) => createSubagent(data),
    onSuccess: (newSubagent) => {
      // Optimistically update the cache
      //@ts-ignore
      queryClient.setQueryData(["subagents"], (oldData: any) => {
        return [...(oldData || []), newSubagent];
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["subagents"] });

      // Show success message
      toast.success("Subagent created successfully");
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(`Failed to create subagent: ${error.message}`);
    },
  });

  return {
    subagents,
    isLoading,
    error: error as Error | null,
    refetch,
    createSubagent: createSubagentMutation,
    isCreating,
  };
}
