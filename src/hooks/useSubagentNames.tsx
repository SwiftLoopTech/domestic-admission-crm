"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubagents } from "@/services/agents";

export function useSubagentNames(enabled: boolean = true) {
  // Fetch all subagents
  const { data: subagents = [], isLoading, error } = useQuery({
    queryKey: ["subagents"],
    queryFn: getSubagents,
    enabled: enabled,
  });

  // Create a mapping of subagent IDs to names
  const subagentMap = subagents.reduce((acc: Record<string, string>, subagent) => {
    // Safety check to ensure subagent and user_id exist
    if (subagent && subagent.user_id && subagent.name) {
      acc[subagent.user_id] = subagent.name;
    }
    return acc;
  }, {});

  // Function to get a subagent name by ID
  const getSubagentName = (id: string | null): string => {
    if (!id) return "None";
    return subagentMap[id] || "Unknown";
  };

  return {
    subagentMap,
    getSubagentName,
    isLoading,
    error: error as Error | null,
  };
}
