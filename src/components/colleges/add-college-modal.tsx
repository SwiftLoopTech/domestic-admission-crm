"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Database } from "@/types/supabase";
import { useAddCollege } from "@/hooks/useColleges";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FileUpload } from "@/components/colleges/file-upload"
import { PlusIcon, BuildingIcon, MapPinIcon, LinkIcon, FileIcon, PhoneIcon, Loader2Icon } from "lucide-react";
import { v4 } from "uuid";

type College = Database['public']['Tables']['colleges']['Row'];

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "College name must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  website_url: z.string()
    .transform((val) => {
      if (!val) return null;
      // Remove any leading/trailing whitespace
      val = val.trim();
      // Return null if empty string
      if (!val) return null;
      // Add https:// if no protocol is specified
      if (!val.match(/^https?:\/\//i)) {
        return `https://${val}`;
      }
      return val;
    })
    .refine((val) => {
      if (!val) return true; // Allow null values
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid website address")
    .nullable(),
  contact_number: z.string().min(10, "Contact number must be at least 10 digits").nullable(),
  agent_id: z.string().nullable(),
  brochure_url: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;



export function AddCollegeModal(){
  const [open, setOpen] = useState(false);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const addCollegeMutation = useAddCollege();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      website_url: null,
      contact_number: null,
      agent_id: null,
      brochure_url: null,
      created_at: null,
      updated_at: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const collegeData: Database['public']['Tables']['colleges']['Insert'] = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await addCollegeMutation.mutateAsync({
        brochureFile,
        collegeData,
      });

      form.reset();
      setBrochureFile(null);
      setOpen(false);
    } catch (error) {
      console.error('Error adding college:', error);
    }
  };

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
      setBrochureFile(null);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 text-white">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add College
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white border-none">
        <DialogHeader className="bg-black p-6 rounded-t-lg">
          <DialogTitle className="text-white flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Add New College
          </DialogTitle>
          <DialogDescription className="text-teal-50">
            Enter the institution details to add it to the system
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                <h3 className="text-sm font-medium text-teal-800 mb-3 flex items-center gap-2">
                  <BuildingIcon className="h-4 w-4" />
                  Institution Details
                </h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>College Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter college name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter contact number"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="example.edu or https://example.edu"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              // Remove https:// or http:// when user is typing
                              let value = e.target.value;
                              value = value.replace(/^https?:\/\//i, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Documents */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                <h3 className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                  <FileIcon className="h-4 w-4" />
                  Documents
                </h3>

                <FileUpload
                  onFileChange={setBrochureFile}
                  label="College Brochure"
                  accept=".pdf,.doc,.docx"
                  maxSize={10}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addCollegeMutation.isPending}
                className="bg-black text-white disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {addCollegeMutation.isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add College
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
