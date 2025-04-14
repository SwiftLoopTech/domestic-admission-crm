"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAddCourse } from "@/hooks/useCourses"
import { useColleges } from "@/hooks/useColleges"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { PlusIcon, BookOpenIcon, BuildingIcon, Loader2Icon } from "lucide-react"

const courseSchema = z.object({
  slno: z.string().min(1, "Serial number is required"),
  course_name: z.string().min(2, "Course name must be at least 2 characters"),
  college_id: z.string().min(1, "Please select a college"),
  duration_years: z.number().min(1, "Duration is required"),
  fees: z.object({
    total: z.number().min(0, "Total fee is required"),
    firstYear: z.number().min(0, "First year fee is required"),
    secondYear: z.number().min(0, "Second year fee is required"),
    thirdYear: z.number().min(0, "Third year fee is required"),
    fourthYear: z.number().min(0, "Fourth year fee is required"),
  }),
  hostel_food_fee: z.number().min(0, "Hostel and food fee is required"),
})

type CourseFormValues = z.infer<typeof courseSchema>

export function AddCourseModal() {
  const [open, setOpen] = useState(false)
  const { data: collegesData } = useColleges()
  const addCourseMutation = useAddCourse()

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      slno: "",
      course_name: "",
      college_id: "",
      duration_years: 4,
      fees: {
        total: 0,
        firstYear: 0,
        secondYear: 0,
        thirdYear: 0,
        fourthYear: 0,
      },
      hostel_food_fee: 0,
    }
  })

  const onSubmit = async (data: CourseFormValues) => {
    try {
      await addCourseMutation.mutateAsync(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error adding course:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white border-none">
        <DialogHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 rounded-t-lg">
          <DialogTitle className="text-white flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5" />
            Add New Course
          </DialogTitle>
          <DialogDescription className="text-teal-50">
            Enter the course details to add it to the system
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="slno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter serial number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="college_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a college" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {collegesData?.colleges?.map((college) => (
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

              <FormField
                control={form.control}
                name="course_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter course name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fee Structure */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Fee Structure</h3>
              
              <FormField
                control={form.control}
                name="fees.total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Fee*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                        placeholder="Enter total fee" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fees.firstYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Year Fee*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                          placeholder="Enter first year fee" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fees.secondYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Second Year Fee*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                          placeholder="Enter second year fee" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fees.thirdYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Third Year Fee*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                          placeholder="Enter third year fee" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fees.fourthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fourth Year Fee*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))}
                          placeholder="Enter fourth year fee" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hostel_food_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel & Food Fee (per year)*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(Number(e.target.value))}
                        placeholder="Enter hostel and food fee" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
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
                disabled={addCourseMutation.isPending}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700"
              >
                {addCourseMutation.isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Adding Course...
                  </>
                ) : (
                  <>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Course
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
