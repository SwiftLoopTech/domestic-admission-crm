"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
import { Database } from "@/types/supabase";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUserRole } from "@/hooks/useUserRole";
import { useSubagents } from "@/hooks/useSubagents";
import { useApplications } from "@/hooks/useApplications";
import { getCurrentUserId } from "@/utils/agents.supabase";
import { APPLICATION_STATUS } from "@/utils/application-status";
import { useColleges } from "@/hooks/useColleges";
import { useCourse, useCourses } from "@/hooks/useCourses";

type College = Database['public']['Tables']['colleges']['Row'];

// Define form schema with Zod
const applicationSchema = z.object({
  student_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  preferred_college: z.string().min(1, "Please select a college"),
  preferred_course: z.string().min(1, "Please select a course"),
  notes: z.string().optional(),
  subagent_id: z.string().uuid().optional().nullable(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;


export function ApplicationModal() {
  const [open, setOpen] = useState(false);
  const { userRole } = useUserRole();
  const { subagents, isLoading: isLoadingSubagents } = useSubagents();
  const { createApplication, isCreating } = useApplications();

  const { data: collegesData } = useColleges();
  const colleges = collegesData?.colleges.map((college) => ({ id: college.id, name: college.name })) || [];
  const [currentCollege, setCurrentCollege] = useState<any | null>(null);
  const { data: coursesData } = useCourses();
  const courses = coursesData?.courses.map((course) => ({ id: course.id, name: course.course_name, collegeID: course.college_id })) || [];
  console.log(courses);
  const filteredCourses = courses.filter((course) => {
    return course.collegeID === currentCollege?.id;
  })
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      student_name: "",
      email: "",
      phone: "",
      preferred_college: "",
      preferred_course: "",
      notes: "",
      subagent_id: null,
    },
  });

  async function onSubmit(data: ApplicationFormValues) {
    try {
      // Get the current user's ID using our utility function
      const currentUserId = await getCurrentUserId();

      const applicationData = {
        ...data,
        // For sub-agents, always use their own ID
        // For agents, use the selected subagent_id or null
        subagent_id: userRole === "sub-agent" ? currentUserId :
                    (data.subagent_id === "self" ? null : data.subagent_id),
        application_status: APPLICATION_STATUS.PENDING,
      };

      // Use the mutation to create the application
      createApplication(applicationData, {
        onSuccess: () => {
          // Close the modal
          setOpen(false);

          // Reset form
          form.reset();
        }
      });
    } catch (error) {
      console.error("Error preparing application data:", error);
      toast.error(`Failed to prepare application data: ${(error as Error).message}`);
    }
  }

  // Reset form when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset({
        student_name: "",
        email: "",
        phone: "",
        preferred_college: "",
        preferred_course: "",
        notes: "",
        subagent_id: null,
      });
    }
    setCurrentCollege(null);
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-900 text-white hover:cursor-pointer hover:shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl">Create New Application</DialogTitle>
          <DialogDescription>
            Fill in the form below to create a new student application.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Name */}
              <FormField
                control={form.control}
                name="student_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Name</FormLabel>
                    <FormControl>
                      <Input className="border-zinc-500" placeholder="Enter student's full name" {...field} />
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
                      <Input className="border-zinc-500" placeholder="student@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input className="border-zinc-500" placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subagent selector (only for agents) */}
              {userRole === "agent" && !isLoadingSubagents && subagents.length > 0 && (
                <FormField
                  control={form.control}
                  name="subagent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Sub-Agent (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-zinc-500">
                            <SelectValue  placeholder="Select sub-agent (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="self">Assign to myself</SelectItem>
                          {subagents.map((subagent) => (
                            <SelectItem
                              key={subagent.user_id}
                              value={subagent.user_id}
                            >
                              {subagent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Leave empty to assign to yourself
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Preferred College */}
              <FormField
                control={form.control}
                name="preferred_college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred College</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedCollege = colleges.find((college) => college.id === value);
                        const data = { id: selectedCollege?.id, name: selectedCollege?.name };
                        setCurrentCollege(data);
                        form.setValue("preferred_course", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-zinc-500">
                          <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {colleges.map((college) => (
                          <SelectItem key={college.id} value={college.id}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Course */}
              <FormField
                control={form.control}
                name="preferred_course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-zinc-500">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {currentCollege === null ? (
                          <p className="text-sm">Select a college first</p>
                        ) : filteredCourses.length === 0 ? (
                          <p>No courses available</p>
                        ) : (filteredCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name}
                          </SelectItem>
                        )))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes or comments"
                      className="min-h-[100px] border-zinc-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-black text-white cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
