"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCounsellors } from "@/hooks/useCounsellors";
import { UserPlus, Loader2 } from "lucide-react";

const counsellorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CounsellorFormValues = z.infer<typeof counsellorSchema>;

interface AddCounsellorModalProps {
  trigger?: React.ReactNode;
}

export function AddCounsellorModal({ trigger }: AddCounsellorModalProps) {
  const [open, setOpen] = useState(false);
  const { counsellors, createCounsellor, isCreating } = useCounsellors();

  const form = useForm<CounsellorFormValues>({
    resolver: zodResolver(counsellorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = (data: CounsellorFormValues) => {
    createCounsellor(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        console.error("Error creating counsellor:", error);
        // Error toast is already handled in the hook
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing the modal while creating
    if (isCreating && !open) {
      return;
    }

    setOpen(open);
    if (!open) {
      form.reset();
    }
  };

  // Check if user has reached the limit of 2 counsellors
  const hasReachedLimit = counsellors.length >= 2;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="bg-[#FFC11F] hover:bg-[#FFC11F]/90 text-black"
            disabled={hasReachedLimit}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {hasReachedLimit ? "Limit Reached (2/2)" : "Add Counsellor"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Counsellor
          </DialogTitle>
          <DialogDescription>
            Create a new counsellor account. You can create a maximum of 2 counsellors.
          </DialogDescription>
        </DialogHeader>

        {/* Loading overlay */}
        {isCreating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#FFC11F]" />
              <p className="text-sm font-medium text-gray-700">Creating counsellor account...</p>
              <p className="text-xs text-gray-500 text-center max-w-xs">
                This may take a few moments. Please don't close this window.
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter counsellor's full name"
                      {...field}
                      className="border-zinc-400"
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address*</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                      className="border-zinc-400"
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number*</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      {...field}
                      className="border-zinc-400"
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password*</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                      className="border-zinc-400"
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    This password will be used for the counsellor&apos;s login. They will need to confirm their email before logging in.
                  </p>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                {isCreating ? "Please wait..." : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-[#FFC11F] hover:bg-[#FFC11F]/90 text-black"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Counsellor...
                  </>
                ) : (
                  "Create Counsellor"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
