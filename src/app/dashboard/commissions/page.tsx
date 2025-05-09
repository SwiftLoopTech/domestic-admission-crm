"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useUserRole } from "@/hooks/useUserRole";
import { useAgentData } from "@/hooks/useAgentData";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TRANSACTION_STATUS } from "@/utils/transaction-status";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  HandCoins,
  Search,
  Users,
  DollarSign,
  BarChart3,
  Percent,
} from "lucide-react";

export default function CommissionsPage() {
  const { transactions, isLoading } = useTransactions();
  const { userRole } = useUserRole();
  const { agent } = useAgentData();
  const isAgent = userRole === "agent";
  const [searchTerm, setSearchTerm] = useState("");

  // Filter completed transactions only
  const completedTransactions = transactions.filter(
    (transaction: any) => transaction.transaction_status === TRANSACTION_STATUS.COMPLETED
  );

  // Filter transactions based on search term
  const filteredTransactions = completedTransactions.filter((transaction: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.student_name.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate commission statistics
  const totalAmount = filteredTransactions.reduce(
    (sum: number, t: any) => sum + (parseFloat(t.amount) || 0),
    0
  );

  // Assume 10% commission rate for now (this could be configurable in the future)
  const commissionRate = 0.1;
  const totalCommission = totalAmount * commissionRate;

  // For subagents, calculate their commission (50% of the total commission)
  const subagentCommissionRate = isAgent ? 0 : 0.5;
  const subagentCommission = isAgent ? 0 : totalCommission * subagentCommissionRate;

  if (isLoading) {
    return <CommissionsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#222B38] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-white flex items-center gap-2">
              <HandCoins className="h-8 w-8" /> Commissions
            </h1>
            <p className="text-white/60 text-sm">
              Track your earnings from completed applications
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-1" /> Total Transaction Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-medium">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 font-medium flex items-center">
              <Percent className="h-4 w-4 mr-1" /> Commission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-medium">
              {isAgent ? "10%" : "5%"}
              <span className="text-sm text-gray-500 ml-2">
                {!isAgent && "(50% of total)"}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 font-medium flex items-center">
              <HandCoins className="h-4 w-4 mr-1" /> Your Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-medium">
              {formatCurrency(isAgent ? totalCommission : subagentCommission)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search completed transactions..."
            className="pl-8 border-zinc-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="border-zinc-400 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Completed Transactions</CardTitle>
          <CardDescription>
            Transactions that have been completed and are eligible for commission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Completed</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Transaction Amount</TableHead>
                <TableHead>Your Commission</TableHead>
                {isAgent && <TableHead>Sub-Agent</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAgent ? 5 : 4}
                    className="text-center py-8 text-gray-500"
                  >
                    No completed transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.completed_at
                        ? format(new Date(transaction.completed_at), "MMM d, yyyy")
                        : format(new Date(transaction.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{transaction.student_name}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      {formatCurrency(
                        isAgent
                          ? transaction.amount * commissionRate
                          : transaction.amount * commissionRate * subagentCommissionRate
                      )}
                    </TableCell>
                    {isAgent && (
                      <TableCell>
                        {transaction.subagent_id ? "Sub-agent" : "Direct"}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commission Structure Info */}
      <Card className="border-zinc-400 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" /> Commission Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {isAgent
              ? "As an agent, you earn 10% commission on all completed transactions. For transactions processed by your sub-agents, the commission is split with 5% going to you and 5% to the sub-agent."
              : `As a sub-agent of ${agent?.name || "your agent"}, you earn 5% commission on all completed transactions you process. This is 50% of the total 10% commission, with the other 5% going to your agent.`}
          </p>
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">Commission Example</h4>
            <p className="text-amber-700">
              For a transaction of ₹100,000:
              <br />
              {isAgent
                ? "- Your commission: ₹10,000 (10%) for direct transactions\n- Your commission: ₹5,000 (5%) for sub-agent transactions"
                : "- Your commission: ₹5,000 (5%)\n- Agent's commission: ₹5,000 (5%)"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton
function CommissionsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl bg-zinc-400" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full bg-zinc-400" />
        ))}
      </div>

      <Skeleton className="h-10 w-96 bg-zinc-400" />

      <div className="space-y-2">
        <Skeleton className="h-10 w-full bg-zinc-400" />
        <Skeleton className="h-96 w-full bg-zinc-400" />
      </div>
    </div>
  );
}