"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useUserRole } from "@/hooks/useUserRole";
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
import { TransactionStatusDropdown } from "@/components/transaction-status-dropdown";
import { TransactionNotesEditor } from "@/components/transaction-notes-editor";
import { TRANSACTION_STATUS_COLORS } from "@/utils/transaction-status";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  Search,
  Eye,
  ArrowUpDown,
  DollarSign,
  Calendar,
  User,
  FileText,
} from "lucide-react";

export default function WalletPage() {
  const { transactions, isLoading } = useTransactions();
  const { userRole } = useUserRole();
  const isAgent = userRole === "agent";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.student_name.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.transaction_status.toLowerCase().includes(searchLower)
    );
  });

  // Calculate total amount for pending and completed transactions
  const pendingAmount = filteredTransactions
    .filter((t: any) => t.transaction_status === "Pending")
    .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

  const completedAmount = filteredTransactions
    .filter((t: any) => t.transaction_status === "Completed")
    .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

  // Handle opening transaction details
  const handleViewDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return <WalletSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#222B38] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-white flex items-center gap-2">
              <Wallet className="h-8 w-8" /> Wallet
            </h1>
            <p className="text-white/60 text-sm">
              Manage student payments and transactions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-medium">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 font-medium">
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-medium">{formatCurrency(pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-400 shadow-md hover:shadow-xl transition duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-700 font-medium">
              Completed Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-medium">{formatCurrency(completedAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search transactions..."
            className="pl-8 border-zinc-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <Card className="border-zinc-400 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {isAgent
              ? "All transactions from your students and sub-agents"
              : "Your transactions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                {isAgent && <TableHead>Sub-Agent</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isAgent ? 6 : 5}
                    className="text-center py-8 text-gray-500"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{transaction.student_name}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        className={TRANSACTION_STATUS_COLORS[transaction.transaction_status]}
                      >
                        {transaction.transaction_status}
                      </Badge>
                    </TableCell>
                    {isAgent && (
                      <TableCell>
                        {transaction.subagent_id ? "Sub-agent" : "Direct"}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(transaction)}
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

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View and manage transaction information
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Created
                    </h3>
                    <p>
                      {format(
                        new Date(selectedTransaction.created_at),
                        "MMMM d, yyyy h:mm a"
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="h-4 w-4 mr-1" /> Student
                    </h3>
                    <p>{selectedTransaction.student_name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" /> Amount
                    </h3>
                    <p className="text-xl font-semibold">
                      {formatCurrency(selectedTransaction.amount)}
                    </p>
                  </div>

                  {selectedTransaction.completed_at && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Completed On
                      </h3>
                      <p>
                        {format(
                          new Date(selectedTransaction.completed_at),
                          "MMMM d, yyyy h:mm a"
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      Status
                    </h3>
                    <div className="mt-1">
                      <TransactionStatusDropdown
                        transactionId={selectedTransaction.id}
                        currentStatus={selectedTransaction.transaction_status}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 flex items-center">
                      <FileText className="h-4 w-4 mr-1" /> Description
                    </h3>
                    <p className="mt-1">
                      {selectedTransaction.description || "No description provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <div className="mt-1">
                      <TransactionNotesEditor
                        transactionId={selectedTransaction.id}
                        initialNotes={selectedTransaction.notes}
                      />
                    </div>
                  </div>
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
function WalletSkeleton() {
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