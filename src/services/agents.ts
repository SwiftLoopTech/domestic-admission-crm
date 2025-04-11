import { supabase } from "@/utils/supabase";

export async function getSubagents() {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No authenticated user found");
    }
    
    const userId = session.user.id;
    
    // Get the agent's ID - make sure to query the user_id field correctly
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (agentError) {
      console.error("Error fetching agent:", agentError);
      throw new Error(`Failed to fetch agent data: ${agentError.message}`);
    }
    
    if (!agentData) {
      return [];
    }
    
    const agentId = agentData.user_id;
    
    // Get all subagents for this agent
    const { data, error } = await supabase
      .from('agents')
      .select('user_id, name')
      .eq('super_agent', agentId);
    
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