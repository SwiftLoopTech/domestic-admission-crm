"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubagents } from "@/services/agents";

export function useSubagents() {
  const {
    data: subagents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subagents"],
    queryFn: getSubagents,
  });

  return {
    subagents,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
