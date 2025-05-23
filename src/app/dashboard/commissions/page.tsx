"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCommissions } from "@/hooks/useCommissions";
import { updateCommission } from "@/services/commissions";
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
import { CommissionStatusDropdown } from "@/components/commission-status-dropdown";
import { CommissionAmountEditor } from "@/components/commission-amount-editor";
import {
  HandCoins,
  Search,
  Users,
  DollarSign,
  BarChart3,
  Percent,
  Eye,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubagentNames } from "@/hooks/useSubagentNames";

export default function CommissionsPage() {
  const { transactions, isLoading: isLoadingTransactions } = useTransactions();
  const { commissions, isLoading: isLoadingCommissions } = useCommissions();
  const { userRole } = useUserRole();
  const { agent } = useAgentData();
  const isAgent = userRole === "agent";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { getSubagentName, isLoading: isLoadingSubagents } = useSubagentNames();

  // Filter completed transactions only
  const completedTransactions = transactions.filter(
    (transaction: any) => transaction.transaction_status === TRANSACTION_STATUS.COMPLETED
  );

  // Filter commissions based on search term
  const filteredCommissions = commissions.filter((commission: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      commission.application?.student_name?.toLowerCase().includes(searchLower) ||
      commission.transaction?.description?.toLowerCase().includes(searchLower) ||
      commission.payment_status.toLowerCase().includes(searchLower)
    );
  });

  // Calculate commission statistics
  const totalCommissionAmount = filteredCommissions.reduce(
    (sum: number, c: any) => sum + (parseFloat(c.amount) || 0),
    0
  );

  // For display purposes, also calculate based on transactions
  const totalTransactionAmount = completedTransactions.reduce(
    (sum: number, t: any) => sum + (parseFloat(t.amount) || 0),
    0
  );

  // Assume 10% commission rate for now (this could be configurable in the future)
  const commissionRate = 0.1;

  // For subagents, calculate their commission (50% of the total commission)
  const subagentCommissionRate = isAgent ? 0 : 0.5;
  const subagentCommission = isAgent ? 0 : totalCommissionAmount * subagentCommissionRate;

  // Handle opening commission details
  const handleViewDetails = (commission: any) => {
    setSelectedCommission(commission);
    setDetailsOpen(true);
  };

  const isLoading = isLoadingTransactions || isLoadingCommissions;

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
            <p className="text-4xl font-medium">{formatCurrency(totalTransactionAmount)}</p>
          </CardContent>
        </Card>
        {/* <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
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
        </Card> */}
        <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 font-medium flex items-center">
              <HandCoins className="h-4 w-4 mr-1" /> Your Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-medium">
              {formatCurrency(totalCommissionAmount)}
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

      {/* Commissions Table */}
      <Card className="border-zinc-400 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Commissions</CardTitle>
          <CardDescription>
            {isAgent
              ? "Commissions for your Associate Partners"
              : "Your commissions from completed transactions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Transaction Amount</TableHead>
                <TableHead>Commission Amount</TableHead>
                <TableHead>Status</TableHead>
                {isAgent && <TableHead>Associate Partner</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAgent ? 7 : 6}
                    className="text-center py-8 text-gray-500"
                  >
                    No commissions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommissions.map((commission: any) => (
                  <TableRow key={commission.id}>
                    <TableCell>
                      {format(new Date(commission.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{commission.application?.student_name || "Unknown"}</TableCell>
                    <TableCell>{formatCurrency(commission.transaction?.amount || 0)}</TableCell>
                    <TableCell>
                      {isAgent ? (
                        <CommissionAmountEditor
                          commissionId={commission.id}
                          initialAmount={commission.amount}
                        />
                      ) : (
                        formatCurrency(commission.amount)
                      )}
                    </TableCell>
                    <TableCell>
                      {isAgent ? (
                        <CommissionStatusDropdown
                          commissionId={commission.id}
                          currentStatus={commission.payment_status}
                        />
                      ) : (
                        <Badge className={`${commission.payment_status === 'completed' ? 'bg-green-200' : 'bg-yellow-200'} text-black`}>
                          {commission.payment_status}
                        </Badge>
                      )}
                    </TableCell>
                    {isAgent && (
                      <TableCell>
                        {commission.subagent_id ? getSubagentName(commission.subagent_id) : "Direct"}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(commission)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Commission Structure Info */}
      {/* <Card className="border-zinc-400 shadow-md">
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
      </Card> */}

      {/* Commission Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Commission Details</DialogTitle>
            <DialogDescription>
              View and manage commission information
            </DialogDescription>
          </DialogHeader>

          {selectedCommission && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Created
                    </h3>
                    <p>
                      {format(
                        new Date(selectedCommission.created_at),
                        "MMMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-1" /> Student
                    </h3>
                    <p>{selectedCommission.application?.student_name || "Unknown"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" /> Transaction Amount
                    </h3>
                    <p className="text-xl">
                      {formatCurrency(selectedCommission.transaction?.amount || 0)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <HandCoins className="h-4 w-4 mr-1" /> Commission Amount
                    </h3>
                    {isAgent ? (
                      <div className="mt-2">
                        <CommissionAmountEditor
                          commissionId={selectedCommission.id}
                          initialAmount={selectedCommission.amount}
                        />
                      </div>
                    ) : (
                      <p className="text-xl font-semibold">
                        {formatCurrency(selectedCommission.amount)}
                      </p>
                    )}
                  </div>

                  {selectedCommission.payment_completed_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Payment Completed On
                      </h3>
                      <p>
                        {format(
                          new Date(selectedCommission.payment_completed_at),
                          "MMMM d, yyyy h:mm a"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      Payment Status
                    </h3>
                    <div className="mt-1">
                      {isAgent ? (
                        <CommissionStatusDropdown
                          commissionId={selectedCommission.id}
                          currentStatus={selectedCommission.payment_status}
                        />
                      ) : (
                        <Badge className={`${selectedCommission.payment_status === 'completed' ? 'bg-green-200' : 'bg-yellow-200'} text-black`}>
                          {selectedCommission.payment_status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FileText className="h-4 w-4 mr-1" /> Notes
                    </h3>
                    <p className="mt-1">
                      {selectedCommission.notes || "No notes provided"}
                    </p>
                  </div>

                  {isAgent && (
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          // Update commission notes
                          const notes = prompt("Enter notes for this commission:", selectedCommission.notes || "");
                          if (notes !== null) {
                            // Call the updateCommission function
                            updateCommission(
                              selectedCommission.id,
                              { notes }
                            );
                          }
                        }}
                      >
                        Edit Notes
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
        <Skeleton className="h-40 w-full bg-zinc-400" />
      </div>
    </div>
  );
}