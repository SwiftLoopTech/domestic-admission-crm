"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/utils/agents.supabase";

type UserRole = "agent" | "sub-agent" | "counsellor" | null;

interface UserRoleContextType {
  userRole: UserRole;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const UserRoleContext = createContext<UserRoleContextType>({
  userRole: null,
  isLoading: false,
  error: null,
  refetch: () => {},
});

async function fetchUserRole(): Promise<UserRole> {
  try {
    // Use the getUserRole function from agents.supabase.ts
    const { role } = await getUserRole();
    return role as UserRole;
  } catch (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }
}

export function UserRoleProvider({
  children
}: {
  children: ReactNode
}) {
  const {
    data: userRole = null,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userRole'],
    queryFn: fetchUserRole,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const contextValue: UserRoleContextType = {
    userRole,
    isLoading,
    error: error as Error | null,
    refetch,
  };

  return (
    <UserRoleContext.Provider value={contextValue}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}