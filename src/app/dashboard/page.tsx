"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { userRole, isLoading, error } = useUserRole();
  
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
      <h1 className="text-2xl font-bold mb-4">
        {userRole === "agent" ? "Agent Dashboard" : "Sub-Agent Dashboard"}
      </h1>
      
      {userRole === "agent" ? (
        <div>
          <p className="mb-4">Welcome to your agent dashboard! You have full access to all features.</p>
          {/* Agent-specific content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sub-Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
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
          <p className="mb-4">Welcome to your sub-agent dashboard! You can manage your assigned applications.</p>
          {/* Sub-agent-specific content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
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