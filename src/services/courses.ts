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
      // Create the college query
      let collegeQuery = supabase
        .from('courses')
        .select(`
          *,
          colleges (id, name, location)
        `, { count: 'exact' });

      // Always use partial match for better search results
      // Partial match for course name
      query = query.ilike('course_name', `%${filters.searchTerm}%`);

      // Partial match for college name
      collegeQuery = collegeQuery.ilike('colleges.name', `%${filters.searchTerm}%`);

      // Apply the same filters to the college query
      if (filters?.collegeId) {
        collegeQuery.eq('college_id', filters.collegeId);
      }

      if (filters?.limit) {
        collegeQuery.limit(filters.limit);
      }

      if (filters?.offset) {
        collegeQuery.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      // Execute both queries and combine results
      const [courseResults, collegeResults] = await Promise.all([
        query,
        collegeQuery
      ]);

      if (courseResults.error) {
        console.error('Error fetching courses by course name:', courseResults.error);
        throw courseResults.error;
      }

      if (collegeResults.error) {
        console.error('Error fetching courses by college name:', collegeResults.error);
        throw collegeResults.error;
      }

      // Combine and deduplicate results
      const combinedData = [...(courseResults.data || []), ...(collegeResults.data || [])];
      const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());

      // Calculate the total count
      const totalCount = Math.min(
        (courseResults.count || 0) + (collegeResults.count || 0),
        uniqueData.length
      );

      return { data: uniqueData, count: totalCount };
    }

    if (filters?.collegeId) {
      query = query.eq('college_id', filters.collegeId);
    }

    // Apply limit and offset if no search term is provided
    if (!filters?.searchTerm) {
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
    }

    // If we have a search term, the function will return earlier in the searchTerm condition
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