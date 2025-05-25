"use client";

import { useState } from "react";
import { useCounsellors } from "@/hooks/useCounsellors";
import { AddCounsellorModal } from "@/components/add-counsellor-modal";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Search,
  MoreHorizontal,
  Trash2,
  UserCheck,
  Phone,
  Mail,
} from "lucide-react";

export default function CounsellorsPage() {
  const { counsellors, isLoading, deleteCounsellor, isDeleting } = useCounsellors();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [counsellorToDelete, setCounsellorToDelete] = useState<string | null>(null);

  // Filter counsellors based on search term
  const filteredCounsellors = counsellors.filter((counsellor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      counsellor.name.toLowerCase().includes(searchLower) ||
      counsellor.email.toLowerCase().includes(searchLower) ||
      counsellor.phone.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteClick = (counsellorId: string) => {
    setCounsellorToDelete(counsellorId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (counsellorToDelete) {
      deleteCounsellor(counsellorToDelete);
      setDeleteDialogOpen(false);
      setCounsellorToDelete(null);
    }
  };

  if (isLoading) {
    return <CounsellorsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#222B38] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-white flex items-center gap-2">
              <Users className="h-8 w-8" /> Counsellors
            </h1>
            <p className="text-white/60 text-sm">
              Manage your counsellors (Maximum 2 allowed)
            </p>
          </div>
          <AddCounsellorModal />
        </div>
      </div>

      {/* Stats Card */}
      <Card className="border-zinc-400 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-zinc-700 font-medium flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Counsellors Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{counsellors.length}/2</p>
              <p className="text-sm text-gray-600">Counsellors Created</p>
            </div>
            <Badge 
              variant={counsellors.length >= 2 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {counsellors.length >= 2 ? "Limit Reached" : `${2 - counsellors.length} Remaining`}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search counsellors..."
            className="pl-8 border-zinc-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Counsellors Table */}
      <Card className="border-zinc-400 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Your Counsellors</CardTitle>
          <CardDescription>
            List of all counsellors under your management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Created</TableHead>
                {/* <TableHead className="text-right">Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCounsellors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {counsellors.length === 0 
                      ? "No counsellors created yet. Click 'Add Counsellor' to get started."
                      : "No counsellors found matching your search."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredCounsellors.map((counsellor) => (
                  <TableRow key={counsellor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        {counsellor.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {counsellor.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {counsellor.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(counsellor.created_at), "MMM d, yyyy")}
                    </TableCell>
                    {/* <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(counsellor.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell> */}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the counsellor
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Loading skeleton
function CounsellorsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl bg-zinc-400" />
      <Skeleton className="h-20 w-full bg-zinc-400" />
      <Skeleton className="h-10 w-96 bg-zinc-400" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full bg-zinc-400" />
        <Skeleton className="h-96 w-full bg-zinc-400" />
      </div>
    </div>
  );
}
