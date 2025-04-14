"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
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
import { PlusIcon, BookOpenIcon, Loader2Icon, PlusCircleIcon, MinusCircleIcon } from "lucide-react"

// Create a dynamic schema for fees based on the number of years
const createFeeSchema = (yearCount: number) => {
  const feeObj: Record<string, z.ZodNumber> = {
    total: z.number().min(0, "Total fee is required"),
  };

  // Add year fields dynamically
  for (let i = 1; i <= yearCount; i++) {
    const yearKey = `year${i}` as const;
    feeObj[yearKey] = z.number().min(0, `Year ${i} fee is required`);
  }

  return z.object(feeObj);
};

// Base schema without fees
const baseSchema = {
  slno: z.string().min(1, "Serial number is required"),
  course_name: z.string().min(2, "Course name must be at least 2 characters"),
  college_id: z.string().min(1, "Please select a college"),
  duration_years: z.number().min(1, "Duration is required"),
  hostel_food_fee: z.number().min(0, "Hostel and food fee is required"),
};

// Initial course schema with 2 years
const courseSchema = z.object({
  ...baseSchema,
  fees: createFeeSchema(5), // Support up to 5 years max
})

type CourseFormValues = z.infer<typeof courseSchema>

export function AddCourseModal() {
  const [open, setOpen] = useState(false)
  const [visibleYears, setVisibleYears] = useState(2) // Start with 2 years
  const { data: collegesData } = useColleges()
  const addCourseMutation = useAddCourse()

  // Initialize form with default values
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      slno: "",
      course_name: "",
      college_id: "",
      duration_years: 4,
      fees: {
        total: 0,
        year1: 0,
        year2: 0,
        year3: 0,
        year4: 0,
        year5: 0,
      },
      hostel_food_fee: 0,
    }
  })

  // Watch individual year fields instead of the entire fees object
  const year1 = useWatch({ control: form.control, name: 'fees.year1' }) || 0
  const year2 = useWatch({ control: form.control, name: 'fees.year2' }) || 0
  const year3 = useWatch({ control: form.control, name: 'fees.year3' }) || 0
  const year4 = useWatch({ control: form.control, name: 'fees.year4' }) || 0
  const year5 = useWatch({ control: form.control, name: 'fees.year5' }) || 0

  // Calculate total fees whenever any year fee changes
  useEffect(() => {
    // Calculate the sum of all year fees
    const total = Number(year1) + Number(year2) + Number(year3) + Number(year4) + Number(year5)

    // Only update if the total has changed to avoid infinite loops
    const currentTotal = form.getValues('fees.total')
    if (total !== currentTotal) {
      form.setValue('fees.total', total, { shouldDirty: false })
    }
  }, [year1, year2, year3, year4, year5, form])

  // Function to add another year field (up to 5)
  const addYearField = () => {
    if (visibleYears < 5) {
      setVisibleYears(prev => prev + 1)
    }
  }

  // Function to remove the last added year field (minimum 2)
  const removeYearField = () => {
    if (visibleYears > 2) {
      // Reset the value of the field being removed to 0
      const fieldToRemove = `fees.year${visibleYears}` as const;
      form.setValue(fieldToRemove, 0, { shouldDirty: false });

      // Decrease the visible years count
      setVisibleYears(prev => prev - 1);
    }
  }

  const onSubmit = async (data: CourseFormValues) => {
    try {
      // Transform the data to match the expected format in the backend
      const transformedData = {
        ...data,
        fees: {
          total: data.fees.total,
          firstYear: data.fees.year1,
          secondYear: data.fees.year2,
          thirdYear: data.fees.year3,
          fourthYear: data.fees.year4,
          fifthYear: data.fees.year5,
        }
      };

      await addCourseMutation.mutateAsync(transformedData);
      setOpen(false); // This will trigger handleOpenChange which resets the form
    } catch (error) {
      console.error('Error adding course:', error);
    }
  }

  // Reset form when dialog is closed
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      form.reset();
      setVisibleYears(2); // Reset to initial 2 years
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                    <FormLabel>Serial Number</FormLabel>
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
                    <FormLabel>College</FormLabel>
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
                    <FormLabel>Course Name</FormLabel>
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
                    <FormLabel>Total Fee (Calculated automatically)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled
                        className="bg-gray-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Dynamically render year fee fields based on visibleYears */}
                {Array.from({ length: visibleYears }).map((_, index) => {
                  const year = index + 1;
                  const fieldName = `fees.year${year}` as const;
                  const yearLabel = [
                    'First', 'Second', 'Third', 'Fourth', 'Fifth'
                  ][index];

                  return (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{yearLabel} Year Fee</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value === 0 ? '' : field.value}
                              onFocus={(e) => {
                                // Clear the field when it gets focus if the value is 0
                                if (field.value === 0) {
                                  e.target.value = '';
                                }
                              }}
                              onChange={(e) => {
                                // If input is empty, set value to 0, otherwise convert to number
                                const value = e.target.value === '' ? 0 : Number(e.target.value);
                                field.onChange(value);
                              }}
                              id={fieldName}
                              placeholder={`Enter ${yearLabel.toLowerCase()} year fee`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>

              {/* Add/Remove Year buttons */}
              <div className="flex flex-col justify-center gap-2 mt-2">
                {/* Add Year button - only show if less than 5 years */}
                {visibleYears < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addYearField}
                    className="flex-1 border-dashed border-gray-300"
                  >
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Add Year {visibleYears + 1} Fee
                  </Button>
                )}

                {/* Remove Year button - only show if more than 2 years */}
                {visibleYears > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={removeYearField}
                    className="flex-1 border-dashed border-gray-300 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <MinusCircleIcon className="h-4 w-4 mr-2" />
                    Remove Year {visibleYears} Fee
                  </Button>
                )}
              </div>

              <FormField
                control={form.control}
                name="hostel_food_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel & Food Fee (per year)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onFocus={(e) => {
                          // Clear the field when it gets focus if the value is 0
                          if (field.value === 0) {
                            e.target.value = '';
                          }
                        }}
                        onChange={(e) => {
                          // If input is empty, set value to 0, otherwise convert to number
                          const value = e.target.value === '' ? 0 : Number(e.target.value);
                          field.onChange(value);
                        }}
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
