"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUserData, AgentData } from "@/utils/agents.supabase";

export function useCurrentUserData() {
  const fetchCurrentUserData = async (): Promise<AgentData | null> => {
    return getCurrentUserData();
  };

  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ["current-user-data"],
    queryFn: fetchCurrentUserData,
  });

  return {
    user,
    isLoading,
    error: error as Error | null,
  };
}
