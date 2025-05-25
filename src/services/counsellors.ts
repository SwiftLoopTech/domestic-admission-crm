import { supabase } from "@/utils/supabase";
import { Database } from "@/types/supabase";
import { getCurrentUserId, getCurrentSession } from "@/utils/agents.supabase";

type Counsellor = Database['public']['Tables']['counsellors']['Row'];
type CreateCounsellorInput = Database['public']['Tables']['counsellors']['Insert'];

export interface CounsellorInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Gets all counsellors for the current authenticated user
 * @returns An array of counsellor records
 */
export async function getCounsellors(): Promise<Counsellor[]> {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    const userId = session.user.id;

    // Get all counsellors for this user (agent or subagent)
    const { data, error } = await supabase
      .from('counsellors')
      .select('*')
      .eq('parent_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching counsellors:", error);
      throw new Error(`Failed to fetch counsellors: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getCounsellors:', error);
    throw error;
  }
}

/**
 * Creates a new counsellor under the current authenticated user
 * @param data The counsellor data (name, email, phone, password)
 * @returns The created counsellor record
 */
export async function createCounsellor(data: CounsellorInput): Promise<Counsellor> {
  try {
    // Get current user's ID (the agent or subagent)
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get the current session
    const session = await getCurrentSession();

    if (!session) {
      throw new Error("No authenticated session found");
    }

    // Get current user's agent data to determine the super agent
    const { data: currentUserAgent, error: agentError } = await supabase
      .from('agents')
      .select('super_agent')
      .eq('user_id', userId)
      .single();

    if (agentError) {
      console.error("Error fetching current user agent data:", agentError);
      throw new Error("Failed to fetch user data");
    }

    // Determine agent_id based on the logic:
    // - If current user has a super_agent, use that as agent_id
    // - Otherwise, use current user's ID as agent_id
    const agentId = currentUserAgent.super_agent || userId;

    // Check if user already has 2 counsellors
    const existingCounsellors = await getCounsellors();
    if (existingCounsellors.length >= 2) {
      throw new Error("You can only create a maximum of 2 counsellors");
    }

    // Store the current session token to restore it later
    const currentSession = session;

    // Create user with signUp but prevent auto-login by using specific options
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
        // This option makes it require email confirmation, preventing auto-login
        emailRedirectTo: window.location.origin + '/login',
      },
    });

    // Restore the original session to ensure we're still logged in as the agent/subagent
    await supabase.auth.setSession({
      access_token: currentSession.access_token,
      refresh_token: currentSession.refresh_token,
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("Failed to create user account");
    }

    // Create the counsellor record
    const counsellorData: CreateCounsellorInput = {
      user_id: authData.user.id, // Use the actual user ID from Auth
      name: data.name,
      email: data.email,
      phone: data.phone,
      parent_id: userId, // The user who created this counsellor
      agent_id: agentId, // The super agent or the current user if they are the agent
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: counsellor, error } = await supabase
      .from('counsellors')
      .insert([counsellorData])
      .select()
      .single();

    if (error) {
      console.error("Error creating counsellor:", error);
      throw new Error(`Failed to create counsellor: ${error.message}`);
    }

    return counsellor;
  } catch (error: any) {
    console.error('Error in createCounsellor:', error);
    throw error;
  }
}

/**
 * Updates a counsellor
 * @param id The counsellor ID
 * @param data The updated counsellor data
 * @returns The updated counsellor record
 */
export async function updateCounsellor(id: string, data: Partial<CounsellorInput>): Promise<Counsellor> {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    const userId = session.user.id;

    // Update the counsellor (only if it belongs to the current user)
    const { data: counsellor, error } = await supabase
      .from('counsellors')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('parent_id', userId) // Ensure user can only update their own counsellors
      .select()
      .single();

    if (error) {
      console.error("Error updating counsellor:", error);
      throw new Error(`Failed to update counsellor: ${error.message}`);
    }

    return counsellor;
  } catch (error: any) {
    console.error('Error in updateCounsellor:', error);
    throw error;
  }
}

/**
 * Deletes a counsellor
 * @param id The counsellor ID
 */
export async function deleteCounsellor(id: string): Promise<void> {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    const userId = session.user.id;

    // Delete the counsellor (only if it belongs to the current user)
    const { error } = await supabase
      .from('counsellors')
      .delete()
      .eq('id', id)
      .eq('parent_id', userId); // Ensure user can only delete their own counsellors

    if (error) {
      console.error("Error deleting counsellor:", error);
      throw new Error(`Failed to delete counsellor: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error in deleteCounsellor:', error);
    throw error;
  }
}
