"use client";

import { format } from "date-fns";

import { SubagentModal } from "@/components/subagent-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSubagents } from "@/hooks/useSubagents";
import { useUserRole } from "@/hooks/useUserRole";

export default function SubagentsPage() {
  // Fetch subagents data using our custom hook
  const { subagents, isLoading, error, refetch } = useSubagents();
  const { userRole } = useUserRole();

  const handleSubagentCreated = () => {
    // Refetch the subagents list when a new one is created
    refetch();
  };

  // This check is redundant with the middleware, but it's good to have as a fallback
  if (userRole !== "agent") {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
        <p className="text-red-700">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return <SubagentsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-red-700">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subagents</h1>
        <SubagentModal onSubagentCreated={handleSubagentCreated} />
      </div>

      {subagents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No subagents found. Add your first subagent to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subagents.map((subagent) => (
              <TableRow key={subagent.user_id}>
                <TableCell className="font-medium">{subagent.name}</TableCell>
                <TableCell>{subagent.email}</TableCell>
                <TableCell>
                  {subagent.created_at
                    ? format(new Date(subagent.created_at), "MMM d, yyyy")
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

// Loading skeleton
function SubagentsPageSkeleton() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}