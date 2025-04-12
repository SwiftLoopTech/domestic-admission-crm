"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApplications, createApplication, updateApplicationStatus } from "@/services/applications";
import { toast } from "sonner";
import { isValidStatusTransition } from "@/utils/application-status";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { userRole } = useUserRole();

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

  // Mutation for updating application status
  const { mutate: updateStatusMutation, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ applicationId, newStatus }: { applicationId: string, newStatus: string }) => {
      // Get the current application to check if the status transition is valid
      const currentApplication = applications.find(app => app.id === applicationId);

      if (!currentApplication) {
        throw new Error("Application not found");
      }

      // Determine if user is an agent
      const isAgent = userRole === "agent";

      // Check if the status transition is valid based on user role
      // Log for debugging
      console.log('Checking status transition:', {
        currentStatus: currentApplication.application_status,
        newStatus,
        userRole,
        isAgent,
        isValid: isValidStatusTransition(currentApplication.application_status, newStatus, isAgent)
      });

      if (!isValidStatusTransition(currentApplication.application_status, newStatus, isAgent)) {
        throw new Error(`Invalid status transition from ${currentApplication.application_status} to ${newStatus}`);
      }

      return updateApplicationStatus(applicationId, newStatus);
    },
    onSuccess: (updatedApplication) => {
      // Optimistically update the cache
      queryClient.setQueryData(["applications"], (oldData: any) => {
        return oldData.map((app: any) =>
          app.id === updatedApplication.id ? updatedApplication : app
        );
      });

      // Invalidate and refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["applications"] });

      // Show success message
      toast.success(`Application status updated to ${updatedApplication.application_status}`);
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(`Failed to update application status: ${error.message}`);
    },
  });

  return {
    applications,
    isLoading,
    error: error as Error | null,
    refetch,
    createApplication: createApplicationMutation,
    isCreating,
    updateStatus: updateStatusMutation,
    isUpdatingStatus,
  };
}
