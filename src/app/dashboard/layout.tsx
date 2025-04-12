"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Sidebar } from "@/components/Sidebar";
import { UserRoleProvider, useUserRole } from "@/hooks/useUserRole";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { userRole, isLoading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Sidebar now handles sign out internally

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar userRole={userRole} />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserRoleProvider>
        <DashboardContent>{children}</DashboardContent>
      </UserRoleProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}