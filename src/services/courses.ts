import { supabase } from "@/utils/supabase";
import { Database } from "@/types/supabase";

type Course = Database['public']['Tables']['courses']['Row'];
type CreateCourseInput = Database['public']['Tables']['courses']['Insert'];

export interface CourseFilters {
  searchTerm?: string;
  collegeId?: string;
  limit?: number;
  offset?: number;
}

export const courseService = {
  /**
   * Create a new course
   */
  async createCourse(input: CreateCourseInput): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        ...input,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw error;
    }

    return data;
  },

  /**
   * Bulk create courses
   */
  async bulkCreateCourses(inputs: CreateCourseInput[]): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .insert(
        inputs.map(input => ({
          ...input,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) {
      console.error('Error bulk creating courses:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get courses with filters
   */
  async getCourses(filters?: CourseFilters) {
    let query = supabase
      .from('courses')
      .select(`
        *,
        colleges (
          id,
          name,
          location
        )
      `, { count: 'exact' });

    if (filters?.searchTerm) {
      query = query.or(`
        course_name.ilike.%${filters.searchTerm}%,
        colleges.name.ilike.%${filters.searchTerm}%
      `);
    }

    if (filters?.collegeId) {
      query = query.eq('college_id', filters.collegeId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

    return { data, count };
  },

  /**
   * Get a single course by ID
   */
  async getCourse(id: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        colleges (
          id,
          name,
          location
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      throw error;
    }

    return data;
  },

  /**
   * Update a course
   */
  async updateCourse(id: string, input: Partial<CreateCourseInput>): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
};