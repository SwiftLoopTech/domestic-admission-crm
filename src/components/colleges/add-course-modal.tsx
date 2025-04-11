"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  PlusIcon, 
  GraduationCap, 
  Building2, 
  MapPin, 
  IndianRupee,
  Home,
  CalendarRange 
} from "lucide-react"

// Dummy colleges data
const COLLEGES = [
  { id: "1", name: "MIT", location: "Cambridge, MA" },
  { id: "2", name: "Stanford University", location: "Stanford, CA" },
  { id: "3", name: "Harvard University", location: "Cambridge, MA" },
]

export interface Course {
  id: string;
  slno: string;
  course: string;
  college: string;
  place: string;
  totalFee: string;
  firstYearFee: string;
  secondYearFee: string;
  thirdYearFee: string;
  fourthYearFee: string;
  hostelFood: string;
}

const courseSchema = z.object({
  slno: z.string().min(1, "Serial number is required"),
  course: z.string().min(2, "Course name must be at least 2 characters"),
  collegeId: z.string().min(1, "Please select a college"),
  place: z.string().min(2, "Place is required"),
  totalFee: z.string().min(1, "Total fee is required"),
  firstYearFee: z.string(),
  secondYearFee: z.string(),
  thirdYearFee: z.string(),
  fourthYearFee: z.string(),
  hostelFood: z.string(),
})

type CourseFormValues = z.infer<typeof courseSchema>

interface AddCourseModalProps {
  onAddCourse: (course: Omit<Course, "id">) => void
}

export function AddCourseModal({ onAddCourse }: AddCourseModalProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      slno: "",
      course: "",
      collegeId: "",
      place: "",
      totalFee: "",
      firstYearFee: "",
      secondYearFee: "",
      thirdYearFee: "",
      fourthYearFee: "",
      hostelFood: ""
    }
  })

  const onSubmit = (data: CourseFormValues) => {
    console.log("Form submitted with:", data)
    const selectedCollege = COLLEGES.find(c => c.id === data.collegeId)
    
    onAddCourse({
      ...data,
      college: selectedCollege?.name || "",
    })
    
    form.reset()
    setOpen(false)
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
            <GraduationCap className="h-5 w-5" />
            Add New Course
          </DialogTitle>
          <DialogDescription className="text-teal-50">
            Enter the course details to add it to the system
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-100">
                  <h3 className="text-sm font-medium text-teal-800 mb-3 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Course Details
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="slno"
                    render={({ field }) => (
                      <FormItem className="mb-2">
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
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Computer Science" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Institution Details
                  </h3>

                  <FormField
                    control={form.control}
                    name="collegeId"
                    render={({ field }) => (
                      <FormItem className="mb-2">
                        <FormLabel>College</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a college" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COLLEGES.map((college) => (
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
                    name="place"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Place</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City, State" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Fee Structure */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <h3 className="text-sm font-medium text-emerald-800 mb-3 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Fee Structure
                  </h3>

                  <FormField
                    control={form.control}
                    name="totalFee"
                    render={({ field }) => (
                      <FormItem className="mb-2">
                        <FormLabel>Total Fee</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 400000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    {["firstYearFee", "secondYearFee", "thirdYearFee", "fourthYearFee"].map((year, index) => (
                      <FormField
                        key={year}
                        control={form.control}
                        name={year as keyof CourseFormValues}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year {index + 1}</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. 100000" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                  <h3 className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Accommodation
                  </h3>

                  <FormField
                    control={form.control}
                    name="hostelFood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hostel & Food Fee (per year)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 50000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 ">
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
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700"
              >
                Add Course
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
