import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collegeService } from '@/services/colleges';
import { toast } from 'sonner';
import { College, CollegeWithCourses, CreateCollegeInput, UpdateCollegeInput } from '@/types/colleges';

export const useColleges = (filters?: {
  searchTerm?: string;
  location?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['colleges', filters],
    queryFn: async () => {
      const { data, count } = await collegeService.getColleges(filters);
      return { colleges: data, total: count };
    },
  });
};

export const useAddCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      brochureFile,
      collegeData
    }: {
      brochureFile: File | null;
      collegeData: CreateCollegeInput
    }) => {
      return await collegeService.createCollege(brochureFile, collegeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast.success('College added successfully', {
        style: { backgroundColor: '#10B981', color: 'white' },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to add college: ' + error.message, {
        style: { backgroundColor: '#991B1B', color: 'white' },
        icon: '❌'
      });
    },
  });
};

export const useUpdateCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string;
      data: Partial<CreateCollegeInput>
    }) => {
      return await collegeService.updateCollege(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast.success('College updated successfully', {
        style: { backgroundColor: '#3B82F6', color: 'white' },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update college: ' + error.message, {
        style: { backgroundColor: '#991B1B', color: 'white' },
        icon: '❌'
      });
    },
  });
};

export const useDeleteCollege = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await collegeService.deleteCollege(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      toast.success('College deleted successfully', {
        style: { backgroundColor: '#EF4444', color: 'white' },
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete college: ' + error.message, {
        style: { backgroundColor: '#991B1B', color: 'white' },
        icon: '❌'
      });
    },
  });
};

export const useCollege = (id: string) => {
  return useQuery<CollegeWithCourses, Error>({
    queryKey: ['college', id],
    queryFn: async () => {
      return await collegeService.getCollege(id) as CollegeWithCourses;
    },
    enabled: !!id,
  });
};