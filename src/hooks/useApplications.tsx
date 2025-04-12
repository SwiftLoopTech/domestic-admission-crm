"use client";

import { useQuery } from "@tanstack/react-query";
import { getApplications } from "@/services/applications";

export function useApplications() {
  const {
    data: applications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  return {
    applications,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
