import { Database } from "@/types/supabase";

// Base College type from Supabase
export type College = Database['public']['Tables']['colleges']['Row'];

// Base Course type from Supabase
export type Course = Database['public']['Tables']['courses']['Row'];

// Course Fee structure
export interface CourseFees {
  total: number;
  firstYear: number;
  secondYear: number;
  thirdYear: number;
  fourthYear: number;
  fifthYear?: number;
}

// Course with typed fees
export interface CourseWithTypedFees extends Omit<Course, 'fees'> {
  fees: CourseFees;
}

// College with courses
export interface CollegeWithCourses extends College {
  courses?: CourseWithTypedFees[];
}

// Create College Input
export type CreateCollegeInput = Database['public']['Tables']['colleges']['Insert'];

// Update College Input
export interface UpdateCollegeInput extends Partial<CreateCollegeInput> {}

// Create Course Input
export type CreateCourseInput = Database['public']['Tables']['courses']['Insert'];

// Update Course Input
export interface UpdateCourseInput extends Partial<CreateCourseInput> {}
