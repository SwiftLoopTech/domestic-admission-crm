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

    // Instead of using partitioned tables, let's use a simpler approach for now
    // We'll use a single applications table with a superagent_id column
    console.log('Using main applications table with superagent_id:', superAgentId);

    // Create the application data object
    const applicationData = {
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
      superagent_id: superAgentId // Add the superagent_id to filter applications
    };

    console.log('Application data:', applicationData);

    // Insert directly into the applications table
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting application:', insertError);
      throw new Error(`Failed to create application: ${insertError.message || 'Database error'}`);
    }

    return application;
  } catch (error) {
    console.error('Create application error:', error);
    throw error;
  }
}

/**
 * Updates the status of an application
 * @param applicationId The ID of the application to update
 * @param newStatus The new status to set
 * @returns The updated application
 */
export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    // Get user role to log for debugging
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('super_agent')
      .eq('user_id', session.user.id)
      .single();

    if (agentError) {
      console.error('Error fetching agent data:', agentError);
    } else {
      console.log('Agent data:', agentData);
      console.log('User is:', agentData.super_agent === null ? 'agent' : 'subagent');
    }

    // Get the application to check permissions
    const { data: applicationData, error: applicationError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (applicationError) {
      console.error('Error fetching application:', applicationError);
      throw new Error(`Failed to fetch application: ${applicationError.message}`);
    }

    console.log('Application data:', applicationData);
    console.log('Updating application status:', { applicationId, newStatus, userId: session.user.id });

    // Update the application status
    const { data, error } = await supabase
      .from('applications')
      .update({
        application_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      throw new Error(`Failed to update application status: ${error.message}`);
    }

    console.log('Update successful, returned data:', data);

    return data;
  } catch (error) {
    console.error('UpdateApplicationStatus error:', error);
    throw error;
  }
}

/**
 * Gets all applications for the current authenticated user
 * @returns An array of application records
 */
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
  let applications = [];

  if (agentData.super_agent === null) {
    // This is a main agent - get all applications where superagent_id equals their user_id
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('superagent_id', agentData.user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    applications = data || [];
  } else {
    // This is a subagent - get applications from their super agent
    // but only those assigned to this subagent or created by this subagent
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('superagent_id', agentData.super_agent)
      .or(`subagent_id.eq.${agentData.user_id},created_by.eq.${agentData.user_id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    applications = data || [];
  }

  return applications;
}
