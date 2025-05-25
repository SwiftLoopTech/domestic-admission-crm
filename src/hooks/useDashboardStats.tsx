"use client";

import { useQuery } from "@tanstack/react-query";
import { getApplications } from "@/services/applications";
import { getSubagents } from "@/services/agents";
import { getCounsellors } from "@/services/counsellors";
import { useUserRole } from "@/hooks/useUserRole";
import { collegeService } from "@/services/colleges";
import { getTransactions } from "@/services/transactions";

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

  // Fetch counsellors (only if user is an agent or subagent)
  const {
    data: counsellors = [],
    isLoading: isLoadingCounsellors,
    error: counsellorsError,
  } = useQuery({
    queryKey: ["counsellors"],
    queryFn: getCounsellors,
    enabled: userRole === "agent" || userRole === "sub-agent",
  });

  // Fetch colleges
  const {
    data: collegesData,
    isLoading: isLoadingColleges,
    error: collegesError,
  } = useQuery({
    queryKey: ["colleges-stats"],
    queryFn: async () => {
      const { data, count } = await collegeService.getColleges();
      return { colleges: data, total: count };
    },
  });

  // Fetch transactions
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  // Calculate stats
  const completedApplications = applications.filter(app => app.application_status === 'completed');
  const completedTransactions = transactions.filter(transaction => transaction.completed === true);
  const pendingPayments = completedApplications.length - completedTransactions.length;

  const stats = {
    applicationsCount: applications.length,
    subagentsCount: subagents.length,
    counsellorsCount: counsellors.length,
    collegesCount: collegesData?.total || 0,
    paymentsCompleted: completedTransactions.length,
    paymentsPending: Math.max(0, pendingPayments), // Ensure non-negative
  };

  const isLoading = isLoadingApplications ||
    (userRole === "agent" && isLoadingSubagents) ||
    ((userRole === "agent" || userRole === "sub-agent") && isLoadingCounsellors) ||
    isLoadingColleges ||
    isLoadingTransactions;

  const error = applicationsError || subagentsError || counsellorsError || collegesError || transactionsError;

  return {
    stats,
    isLoading,
    error: error as Error | null,
  };
}
