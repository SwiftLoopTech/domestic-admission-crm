import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";

interface ApplicationInput {
  student_name: string;
  email: string;
  phone: string;
  preferred_college: string;
  preferred_course: string;
  application_status: string;
  notes?: string;
  subagent_id?: string | null;
}

export async function createApplication(data: ApplicationInput) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No authenticated user found");
    }
    
    const userId = session.user.id;
    
    // Determine if user is an agent or subagent
    // Important: Use eq() on the user_id field
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('super_agent, user_id')
      .eq('user_id', userId)
      .single();
    
    if (agentError) {
      console.error('Error fetching agent data:', agentError);
      throw new Error(`Failed to fetch agent data: ${agentError.message}`);
    }
    
    if (!agentData) {
      throw new Error("No agent record found for this user");
    }
    
    // Determine which partition to insert into based on the hierarchy
    let superAgentId: string;
    
    if (agentData.super_agent === null) {
      // This is a main agent
      superAgentId = agentData.user_id;
    } else {
      // This is a subagent
      superAgentId = agentData.super_agent;
    }
    
    // Generate the table name with the partition
    const tableName = `applications_${superAgentId}`;
    
    // First create the partition table if it doesn't exist
    const { error: createPartitionError } = await supabase
      .rpc('create_application_partition', { 
        superagent_id: superAgentId 
      });
    
    if (createPartitionError) {
      console.error('Error creating partition:', createPartitionError);
      throw new Error(`Failed to create partition: ${createPartitionError.message}`);
    }
    
    // Wait a brief moment for the table to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Register the partition if not already registered
    const { error: registryError } = await supabase
      .from('applications_registry')
      .upsert({ 
        superagent_id: superAgentId 
      }, { 
        onConflict: 'superagent_id' 
      });
    
    if (registryError) {
      console.error('Error registering partition:', registryError);
      throw new Error(`Failed to register partition: ${registryError.message}`);
    }
    
    // Now insert the application into the partition
    const { data: application, error: insertError } = await supabase
      .from(tableName)
      .insert({
        id: uuidv4(),
        student_name: data.student_name,
        email: data.email,
        phone: data.phone,
        preferred_college: data.preferred_college,
        preferred_course: data.preferred_course,
        application_status: data.application_status,
        notes: data.notes || null,
        created_by: agentData.user_id, // Use agent ID, not user ID
        subagent_id: data.subagent_id || null,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting application:', insertError);
      throw new Error(`Failed to create application: ${insertError.message}`);
    }
    
    return application;
  } catch (error) {
    console.error('Create application error:', error);
    throw error;
  }
}

export async function getApplications() {
  // Get current user's ID
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("No authenticated user found");
  }
  
  const userId = session.user.id;
  
  // Get the agent data
  const { data: agentData, error: agentError } = await supabase
    .from('agents')
    .select('super_agent, user_id')
    .eq('user_id', userId)
    .single();
  
  if (agentError) {
    throw new Error(`Failed to fetch agent data: ${agentError.message}`);
  }
  
  // Determine if this is a main agent or subagent
  let superAgentId: string;
  let applications = [];
  
  if (agentData.super_agent === null) {
    // This is a main agent - get applications from their partition
    superAgentId = agentData.user_id;
    const tableName = `applications_${superAgentId}`;
    
    // Check if the table exists
    const { error: tableCheckError } = await supabase
      .from('applications_registry')
      .select('superagent_id')
      .eq('superagent_id', superAgentId)
      .single();
    
    if (!tableCheckError) {
      // Table exists, fetch applications
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }
      
      applications = data || [];
    }
  } else {
    // This is a subagent - get applications from their super agent's partition
    // but only those assigned to this subagent or created by this subagent
    superAgentId = agentData.super_agent;
    const tableName = `applications_${superAgentId}`;
    
    // Check if the table exists
    const { error: tableCheckError } = await supabase
      .from('applications_registry')
      .select('superagent_id')
      .eq('superagent_id', superAgentId)
      .single();
    
    if (!tableCheckError) {
      // Table exists, fetch applications assigned to this subagent or created by them
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .or(`subagent_id.eq.${agentData.user_id},created_by.eq.${agentData.user_id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch applications: ${error.message}`);
      }
      
      applications = data || [];
    }
  }
  
  return applications;
}
