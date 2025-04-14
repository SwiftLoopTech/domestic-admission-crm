import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collegeService } from '@/services/colleges';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';

type College = Database['public']['Tables']['colleges']['Row'];
type CreateCollegeInput = Database['public']['Tables']['colleges']['Insert'];

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
      toast.success('College added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add college: ' + error.message);
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
      toast.success('College updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update college: ' + error.message);
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
      toast.success('College deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete college: ' + error.message);
    },
  });
};

export const useCollege = (id: string) => {
  return useQuery({
    queryKey: ['college', id],
    queryFn: async () => {
      return await collegeService.getCollege(id);
    },
    enabled: !!id,
  });
};