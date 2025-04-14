"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationModal } from "@/components/application-modal";

export default function DashboardPage() {
  const { userRole, isLoading: isLoadingRole, error: roleError } = useUserRole();
  const { stats, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  const isLoading = isLoadingRole || isLoadingStats;
  const error = roleError || statsError;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {userRole === "agent" ? "Agent Dashboard" : "Sub-Agent Dashboard"}
        </h1>

        <ApplicationModal/>
      </div>

      {userRole === "agent" ? (
        <div>
          <p className="mb-4">Welcome to your agent dashboard.</p>
          {/* Agent-specific content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.applicationsCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sub-Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.subagentsCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">No recent activity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-4">Welcome to your sub-agent dashboard.</p>
          {/* Sub-agent-specific content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.applicationsCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">No recent activity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-5 w-full max-w-md mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}