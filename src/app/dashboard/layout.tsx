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
  const { userRole, isLoading, error } = useUserRole();
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated but has no role data
  if (!isLoading && userRole === null && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No User Data Available</h2>
          <p className="text-gray-600 mb-6">
            Your account is authenticated, but we couldn't find your user data in our system.
            Please contact the administrators to resolve this issue.
          </p>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
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