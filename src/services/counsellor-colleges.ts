import { supabase } from "@/utils/supabase";
import { Database } from "@/types/supabase";
import { getCurrentUserId } from "@/utils/agents.supabase";

type College = Database['public']['Tables']['colleges']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];

/**
 * Gets all colleges available to the counsellor (based on their agent_id)
 * @returns An array of college records
 */
export async function getCounsellorColleges(): Promise<College[]> {
  try {
    // Get current user's ID
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get counsellor data to find their agent_id
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('counsellors')
      .select('agent_id')
      .eq('user_id', userId)
      .single();

    if (counsellorError) {
      console.error("Error fetching counsellor data:", counsellorError);
      throw new Error("Failed to fetch counsellor data");
    }

    if (!counsellorData) {
      throw new Error("Counsellor data not found");
    }

    // Get all colleges for the agent
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('agent_id', counsellorData.agent_id)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching colleges:", error);
      throw new Error(`Failed to fetch colleges: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getCounsellorColleges:', error);
    throw error;
  }
}

/**
 * Gets all courses for a specific college (for counsellors)
 * @param collegeId The college ID
 * @returns An array of course records
 */
export async function getCounsellorCourses(collegeId?: string): Promise<Course[]> {
  try {
    // Get current user's ID
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get counsellor data to find their agent_id
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('counsellors')
      .select('agent_id')
      .eq('user_id', userId)
      .single();

    if (counsellorError) {
      console.error("Error fetching counsellor data:", counsellorError);
      throw new Error("Failed to fetch counsellor data");
    }

    if (!counsellorData) {
      throw new Error("Counsellor data not found");
    }

    // Build the query
    let query = supabase
      .from('courses')
      .select(`
        *,
        colleges!inner(
          id,
          name,
          location,
          agent_id
        )
      `)
      .eq('colleges.agent_id', counsellorData.agent_id)
      .order('course_name', { ascending: true });

    // Add college filter if provided
    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching courses:", error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getCounsellorCourses:', error);
    throw error;
  }
}

/**
 * Gets a specific college by ID (for counsellors)
 * @param collegeId The college ID
 * @returns The college record
 */
export async function getCounsellorCollegeById(collegeId: string): Promise<College | null> {
  try {
    // Get current user's ID
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get counsellor data to find their agent_id
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('counsellors')
      .select('agent_id')
      .eq('user_id', userId)
      .single();

    if (counsellorError) {
      console.error("Error fetching counsellor data:", counsellorError);
      throw new Error("Failed to fetch counsellor data");
    }

    if (!counsellorData) {
      throw new Error("Counsellor data not found");
    }

    // Get the specific college
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('id', collegeId)
      .eq('agent_id', counsellorData.agent_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // College not found or not accessible
      }
      console.error("Error fetching college:", error);
      throw new Error(`Failed to fetch college: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error in getCounsellorCollegeById:', error);
    throw error;
  }
}

/**
 * Searches colleges by name for counsellors
 * @param searchTerm The search term
 * @returns An array of matching college records
 */
export async function searchCounsellorColleges(searchTerm: string): Promise<College[]> {
  try {
    // Get current user's ID
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get counsellor data to find their agent_id
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('counsellors')
      .select('agent_id')
      .eq('user_id', userId)
      .single();

    if (counsellorError) {
      console.error("Error fetching counsellor data:", counsellorError);
      throw new Error("Failed to fetch counsellor data");
    }

    if (!counsellorData) {
      throw new Error("Counsellor data not found");
    }

    // Search colleges
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('agent_id', counsellorData.agent_id)
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error searching colleges:", error);
      throw new Error(`Failed to search colleges: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in searchCounsellorColleges:', error);
    throw error;
  }
}

/**
 * Searches courses by name for counsellors
 * @param searchTerm The search term
 * @returns An array of matching course records
 */
export async function searchCounsellorCourses(searchTerm: string): Promise<Course[]> {
  try {
    // Get current user's ID
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get counsellor data to find their agent_id
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('counsellors')
      .select('agent_id')
      .eq('user_id', userId)
      .single();

    if (counsellorError) {
      console.error("Error fetching counsellor data:", counsellorError);
      throw new Error("Failed to fetch counsellor data");
    }

    if (!counsellorData) {
      throw new Error("Counsellor data not found");
    }

    // Search courses
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        colleges!inner(
          id,
          name,
          location,
          agent_id
        )
      `)
      .eq('colleges.agent_id', counsellorData.agent_id)
      .ilike('course_name', `%${searchTerm}%`)
      .order('course_name', { ascending: true });

    if (error) {
      console.error("Error searching courses:", error);
      throw new Error(`Failed to search courses: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in searchCounsellorCourses:', error);
    throw error;
  }
}
