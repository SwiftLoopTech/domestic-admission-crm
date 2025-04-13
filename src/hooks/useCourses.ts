import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courses';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';

type Course = Database['public']['Tables']['courses']['Row'];
type CreateCourseInput = Database['public']['Tables']['courses']['Insert'];

export const useCourses = (filters?: {
  searchTerm?: string;
  collegeId?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const { data, count } = await courseService.getCourses(filters);
      return { courses: data, total: count };
    },
  });
};

export const useAddCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: CreateCourseInput) => {
      return await courseService.createCourse(courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add course: ' + error.message);
    },
  });
};

export const useBulkAddCourses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coursesData: CreateCourseInput[]) => {
      return await courseService.bulkCreateCourses(coursesData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success(`Successfully added ${variables.length} courses`);
    },
    onError: (error: Error) => {
      toast.error('Failed to bulk add courses: ' + error.message);
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Partial<CreateCourseInput> 
    }) => {
      return await courseService.updateCourse(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update course: ' + error.message);
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await courseService.deleteCourse(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete course: ' + error.message);
    },
  });
};

export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      return await courseService.getCourse(id);
    },
    enabled: !!id,
  });
};