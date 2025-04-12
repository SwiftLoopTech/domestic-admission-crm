"use client";

import { useQuery } from "@tanstack/react-query";
import { getApplications } from "@/services/applications";
import { getSubagents } from "@/services/agents";
import { useUserRole } from "@/hooks/useUserRole";

export function useDashboardStats() {
  const { userRole } = useUserRole();
  
  // Fetch applications
  const { 
    data: applications = [],
    isLoading: isLoadingApplications,
    error: applicationsError,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });
  
  // Fetch subagents (only if user is an agent)
  const { 
    data: subagents = [],
    isLoading: isLoadingSubagents,
    error: subagentsError,
  } = useQuery({
    queryKey: ["subagents"],
    queryFn: getSubagents,
    enabled: userRole === "agent",
  });
  
  // Calculate stats
  const stats = {
    applicationsCount: applications.length,
    subagentsCount: subagents.length,
  };
  
  const isLoading = isLoadingApplications || (userRole === "agent" && isLoadingSubagents);
  const error = applicationsError || subagentsError;
  
  return {
    stats,
    isLoading,
    error: error as Error | null,
  };
}
