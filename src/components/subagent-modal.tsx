"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createSubagent } from "@/services/agents";

// Define form schema with Zod
const subagentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  // We're not actually creating a user account anymore, but keeping the password field for future use
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SubagentFormValues = z.infer<typeof subagentSchema>;

interface SubagentModalProps {
  onSubagentCreated?: () => void;
}

export function SubagentModal({ onSubagentCreated }: SubagentModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<SubagentFormValues>({
    resolver: zodResolver(subagentSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SubagentFormValues) {
    setIsSubmitting(true);

    try {
      // Call the API service to create the subagent
      await createSubagent(data);

      // Show success message
      toast.success(
        "Subagent created successfully. They will need to confirm their email before logging in."
      );

      // Close the modal
      setOpen(false);

      // Reset form
      form.reset();

      // Trigger callback if provided
      if (onSubagentCreated) {
        onSubagentCreated();
      }
    } catch (error) {
      console.error("Error creating subagent:", error);
      toast.error("Failed to create subagent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="border-[1px] border-black hover:cursor-pointer hover:shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subagent
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Subagent</DialogTitle>
          <DialogDescription>
            Fill in the form below to add a new subagent to your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subagent's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="subagent@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      This password will be used for the subagent&apos;s login. They will need to confirm their email before logging in.
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Subagent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
