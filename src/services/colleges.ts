
import { supabase } from "@/utils/supabase";
import { Database } from "@/types/supabase";

type College = Database['public']['Tables']['colleges']['Row'];

type CreateCollegeInput = Database['public']['Tables']['colleges']['Insert'];

export interface UpdateCollegeInput extends Partial<CreateCollegeInput> {}

export interface CollegeFilters {
  location?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export const collegeService = {
  /**
   * Create a new college
   */
  async createCollege(brochureFile:File|null,input: CreateCollegeInput): Promise<College> {
    
    const { data, error } = await supabase
      .from('colleges')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error creating college:', error);
      throw error;
    }
    if(brochureFile){
      await this.uploadBrochure(data.id, brochureFile);
    }
    return data;
  },

  /**
   * Get a single college by ID
   */
  async getCollege(id: string): Promise<College | null> {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        *,
        courses (
          id,
          course_name,
          duration_years,
          fees
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching college:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get all colleges with optional filtering
   */
  async getColleges(filters?: CollegeFilters) {
    console.log("This was called")
    let query = supabase
      .from('colleges')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.searchTerm) {
      query = query.or(`
        name.ilike.%${filters.searchTerm}%,
        location.ilike.%${filters.searchTerm}%
      `);
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    // Order by name
    query = query.order('name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching colleges:', error);
      throw error;
    }
    console.log(data,count)
    return { data, count };
  },

  /**
   * Update a college
   */
  async updateCollege(id: string, input: UpdateCollegeInput): Promise<College> {
    const { data, error } = await supabase
      .from('colleges')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating college:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a college
   */
  async deleteCollege(id: string): Promise<void> {
    const { error } = await supabase
      .from('colleges')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting college:', error);
      throw error;
    }
  },

  /**
   * Upload college brochure
   */
  async uploadBrochure(collegeId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${collegeId}-${Date.now()}.${fileExt}`;
    const filePath = `college-brochures/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('brochures')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading brochure:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('brochures')
      .getPublicUrl(filePath);

    // Update college with new brochure URL
    await this.updateCollege(collegeId, { brochure_url: publicUrl });

    return publicUrl;
  },

  /**
   * Get colleges with course statistics
   */
  async getCollegesWithStats() {
    const { data, error } = await supabase
      .from('colleges')
      .select(`
        *,
        courses (
          count,
          fees
        )
      `);

    if (error) {
      console.error('Error fetching college stats:', error);
      throw error;
    }

    return data;
  },

  /**
   * Search colleges by name or location
   */
  async searchColleges(searchTerm: string) {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .or(`
        name.ilike.%${searchTerm}%,
        location.ilike.%${searchTerm}%
      `)
      .limit(10);

    if (error) {
      console.error('Error searching colleges:', error);
      throw error;
    }

    return data;
  },

  /**
   * Check if a college exists with given name and place
   */
  async checkCollegeExists(name: string, place: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('colleges')
      .select('id')
      .eq('name', name)
      .eq('location', place)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking college:', error);
      throw error;
    }

    return !!data;
  },

  /**
   * Get a college by name and place
   */
  async getCollegeByNameAndPlace(name: string, place: string): Promise<College | null> {
    const { data, error } = await supabase
      .from('colleges')
      .select()
      .eq('name', name)
      .eq('location', place)
      .single();

    if (error) {
      console.error('Error fetching college:', error);
      throw error;
    }

    return data;
  }
};

