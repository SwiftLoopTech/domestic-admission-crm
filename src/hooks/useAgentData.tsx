"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgentData, AgentData } from "@/utils/agents.supabase";

// Using the AgentData interface from agents.supabase.ts

export function useAgentData() {
  // Use the getAgentData function from agents.supabase.ts
  const fetchAgentData = async (): Promise<AgentData | null> => {
    return getAgentData();
  };

  const {
    data: agent,
    isLoading,
    error
  } = useQuery({
    queryKey: ["agent-data"],
    queryFn: fetchAgentData,
  });

  return {
    agent,
    isLoading,
    error: error as Error | null,
  };
}
