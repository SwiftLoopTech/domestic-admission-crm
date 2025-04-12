"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApplications, createApplication } from "@/services/applications";
import { toast } from "sonner";

interface ApplicationInput {
  student_name: string;
  email: string;
  phone: string;
  preferred_college: string;
  preferred_course: string;
  application_status: string;
  notes?: string;
  subagent_id?: string | null;
}

export function useApplications() {
  const queryClient = useQueryClient();

  // Query for fetching applications
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  // Mutation for creating an application
  const { mutate: createApplicationMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: ApplicationInput) => createApplication(data),
    onSuccess: (newApplication) => {
      // Optimistically update the cache
      queryClient.setQueryData(["applications"], (oldData: any) => {
        return [...(oldData || []), newApplication];
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["applications"] });

      // Also invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      // Show success message
      toast.success("Application created successfully");
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(`Failed to create application: ${error.message}`);
    },
  });

  return {
    applications,
    isLoading,
    error: error as Error | null,
    refetch,
    createApplication: createApplicationMutation,
    isCreating,
  };
}
