"use client";

import { useQuery } from "@tanstack/react-query";
import { getApplications } from "@/services/applications";
import { getSubagents } from "@/services/agents";
import { getCounsellors } from "@/services/counsellors";
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

  // Fetch counsellors
  const {
    data: counsellors = [],
    isLoading: isLoadingCounsellors,
    error: counsellorsError,
  } = useQuery({
    queryKey: ["counsellors"],
    queryFn: getCounsellors,
  });

  // Calculate stats
  const stats = {
    applicationsCount: applications.length,
    subagentsCount: subagents.length,
    counsellorsCount: counsellors.length,
  };

  const isLoading = isLoadingApplications || (userRole === "agent" && isLoadingSubagents) || isLoadingCounsellors;
  const error = applicationsError || subagentsError || counsellorsError;

  return {
    stats,
    isLoading,
    error: error as Error | null,
  };
}
