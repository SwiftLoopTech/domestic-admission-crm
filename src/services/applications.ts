import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { APPLICATION_STATUS } from "@/utils/application-status";
import { createTransaction } from "@/services/transactions";

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

interface ApplicationUpdateInput {
  student_name?: string;
  email?: string;
  phone?: string;
  preferred_college?: string;
  preferred_course?: string;
  notes?: string;
  document_links?: string[];
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
      .select('super_agent, user_id')
      .eq('user_id', session.user.id)
      .single();

    if (agentError) {
      console.error('Error fetching agent data:', agentError);
      throw new Error(`Failed to fetch agent data: ${agentError.message}`);
    }

    const isAgent = agentData.super_agent === null;
    console.log('User is:', isAgent ? 'agent' : 'subagent');

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

    // If the application is being marked as completed, create a transaction
    if (newStatus === APPLICATION_STATUS.COMPLETED) {
      try {
        let amount = 0;
        let courseName = applicationData.preferred_course;
        let collegeName = applicationData.preferred_college;

        // Check if preferred_course and preferred_college are UUIDs or names
        const isUuid = (str: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(str);
        };

        // If preferred_course is a UUID, fetch course details
        if (isUuid(applicationData.preferred_course)) {
          try {
            const { data: courseData, error: courseError } = await supabase
              .from('courses')
              .select('*, colleges(name)')
              .eq('id', applicationData.preferred_course)
              .single();

            if (!courseError && courseData) {
              courseName = courseData.course_name;

              // Extract the firstYear fee from the course fees
              if (courseData.fees) {
                // Check if fees is a string that needs parsing
                const fees = typeof courseData.fees === 'string'
                  ? JSON.parse(courseData.fees)
                  : courseData.fees;

                // Try to get firstYear fee, fallback to 0 if not found
                amount = fees.firstYear || 0;
              }
            }
          } catch (error) {
            console.error('Error fetching course by ID:', error);
            // Continue with default values
          }
        } else {
          // If preferred_course is a name, try to find the course by name
          try {
            const { data: courseData, error: courseError } = await supabase
              .from('courses')
              .select('*, colleges(name)')
              .ilike('course_name', applicationData.preferred_course)
              .limit(1)
              .single();

            if (!courseError && courseData) {
              // Extract the firstYear fee from the course fees
              if (courseData.fees) {
                // Check if fees is a string that needs parsing
                const fees = typeof courseData.fees === 'string'
                  ? JSON.parse(courseData.fees)
                  : courseData.fees;

                // Try to get firstYear fee, fallback to 0 if not found
                amount = fees.firstYear || 0;
              }
            }
          } catch (error) {
            console.error('Error fetching course by name:', error);
            // Continue with default values
          }
        }

        // If preferred_college is a UUID, fetch college details
        if (isUuid(applicationData.preferred_college)) {
          try {
            const { data: collegeData, error: collegeError } = await supabase
              .from('colleges')
              .select('name')
              .eq('id', applicationData.preferred_college)
              .single();

            if (!collegeError && collegeData) {
              collegeName = collegeData.name;
            }
          } catch (error) {
            console.error('Error fetching college by ID:', error);
            // Continue with default values
          }
        }

        // Create a transaction for this completed application
        await createTransaction({
          application_id: applicationId,
          student_name: applicationData.student_name,
          amount: amount,
          subagent_id: applicationData.subagent_id,
          description: `Payment for ${courseName} at ${collegeName}`,
          notes: "Transaction created automatically when application was marked as completed."
        });
        console.log('Transaction created for completed application with amount:', amount);
      } catch (transactionError) {
        console.error('Error creating transaction:', transactionError);
        // Don't throw here, we still want to return the updated application
        // Just log the error
      }
    }

    return data;
  } catch (error) {
    console.error('UpdateApplicationStatus error:', error);
    throw error;
  }
}

/**
 * Updates an application's details
 * @param applicationId The ID of the application to update
 * @param data The data to update
 * @param isAgent Whether the current user is an agent (for permission checks)
 * @returns The updated application
 */
export async function updateApplication(applicationId: string, data: ApplicationUpdateInput, isAgent: boolean) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
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

    // If user is a subagent, they can only update notes
    // and documents if status is 'Verified'
    if (!isAgent) {
      // Create a new object with only the allowed fields
      const allowedData: ApplicationUpdateInput = {};

      // Notes can always be updated by subagents
      if (data.notes !== undefined) {
        allowedData.notes = data.notes;
      }

      // Documents can only be updated if status is 'Verified'
      if (applicationData.application_status === 'Verified' && data.document_links !== undefined) {
        allowedData.document_links = data.document_links;
      }

      // Update with restricted fields
      const { data: updatedData, error } = await supabase
        .from('applications')
        .update({
          ...allowedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating application:', error);
        throw new Error(`Failed to update application: ${error.message}`);
      }

      return updatedData;
    }

    // For agents, allow updating all fields
    const { data: updatedData, error } = await supabase
      .from('applications')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      throw new Error(`Failed to update application: ${error.message}`);
    }

    return updatedData;
  } catch (error) {
    console.error('Update application error:', error);
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
  let applications = [];

  // First, fetch all colleges to use for name lookups
  const { data: colleges, error: collegesError } = await supabase
    .from('colleges')
    .select('id, name');

  if (collegesError) {
    console.error('Error fetching colleges:', collegesError);
    throw new Error(`Failed to fetch colleges: ${collegesError.message}`);
  }

  // Create a map of college IDs to names for quick lookup
  const collegeMap = new Map();
  colleges.forEach((college: any) => {
    collegeMap.set(college.id, college.name);
  });

  // Fetch all courses to use for name lookups
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, course_name');

  if (coursesError) {
    console.error('Error fetching courses:', coursesError);
    throw new Error(`Failed to fetch courses: ${coursesError.message}`);
  }

  // Create a map of course IDs to names for quick lookup
  const courseMap = new Map();
  courses.forEach((course: any) => {
    courseMap.set(course.id, course.course_name);
  });

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

  // Enhance applications with college and course names
  applications = applications.map((app: any) => {
    // Add college name if ID exists and is in our map
    const collegeName = collegeMap.get(app.preferred_college) || app.preferred_college;

    // Add course name if ID exists and is in our map
    const courseName = courseMap.get(app.preferred_course) || app.preferred_course;

    return {
      ...app,
      college_name: collegeName,
      course_name: courseName
    };
  });

  return applications;
}
