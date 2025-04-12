import { supabase } from "@/utils/supabase";

export interface AgentData {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  super_agent: string | null;
}

interface SubagentInput {
  name: string;
  email: string;
  password: string; // Password for the new user account
}

/**
 * Creates a new subagent under the current authenticated user
 * @param data The subagent data (name, email, password)
 * @returns The created subagent record
 */
export async function createSubagent(data: SubagentInput) {
  try {
    // Get current user's ID (the agent)
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get the current session
    const session = await getCurrentSession();

    if (!session) {
      throw new Error("No authenticated session found");
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

    // Restore the original session to ensure we're still logged in as the agent
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

    // Auto-confirm the email since we're creating a subagent
    // This requires the service role key which we don't have in client-side code
    // Instead, we'll make the subagent record with the user ID we have

    // Now create the subagent record in the agents table
    const { data: subagent, error: dbError } = await supabase
      .from('agents')
      .insert([
        {
          user_id: authData.user.id, // Use the actual user ID from Auth
          name: data.name,
          email: data.email,
          super_agent: userId, // Set the current user as the super_agent
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Error creating subagent record:", dbError);
      throw new Error(`Failed to create subagent record: ${dbError.message}`);
    }

    return subagent;
  } catch (error) {
    console.error("CreateSubagent error:", error);
    throw error;
  }
}

/**
 * Gets all subagents for the current authenticated user
 * @returns An array of subagent records
 */
/**
 * Gets the current authenticated user's session
 * @returns The user session or null if not authenticated
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Gets the current user's ID
 * @returns The user ID or null if not authenticated
 */
export async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.user?.id || null;
}

/**
 * Gets the agent data for the current user
 * @returns The agent data or null if not found
 */
export async function getAgentData(): Promise<AgentData | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  // Fetch the agent data from the agents table
  const { data, error } = await supabase
    .from('agents')
    .select('user_id, name, email, created_at, super_agent')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error("Error fetching agent data:", error);
    throw new Error(`Failed to fetch agent data: ${error.message}`);
  }

  return data;
}

/**
 * Determines if the current user is an agent or subagent
 * @returns An object with the user role and agent data
 */
export async function getUserRole() {
  const agentData = await getAgentData();

  if (!agentData) {
    return { role: null, agent: null };
  }

  const role = agentData.super_agent === null ? "agent" : "sub-agent";

  return { role, agent: agentData };
}

export async function getSubagents() {
  try {
    // Get current user's ID (the agent)
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get all subagents for this agent
    const { data, error } = await supabase
      .from('agents')
      .select('user_id, name, email, created_at')
      .eq('super_agent', userId);

    if (error) {
      console.error("Error fetching subagents:", error);
      throw new Error(`Failed to fetch subagents: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("GetSubagents error:", error);
    throw error;
  }
}
