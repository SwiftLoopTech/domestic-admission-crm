import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { APPLICATION_STATUS } from "@/utils/application-status";
import { createTransaction } from "@/services/transactions";
import { TRANSACTION_STATUS } from "@/utils/transaction-status";

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
      // Check if user is a counsellor (counsellors cannot create applications)
      const { data: counsellorData, error: counsellorError } = await supabase
        .from('counsellors')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (!counsellorError && counsellorData) {
        throw new Error("Counsellors are not allowed to create applications");
      }

      console.error('Error fetching Partner data:', agentError);
      throw new Error(`Failed to fetch Partner data: ${agentError.message}`);
    }

    if (!agentData) {
      throw new Error("No Partner record found for this user");
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

      // Set subagent_id based on role
      // If this is a subagent, set subagent_id to their own ID
      // If this is an agent, use the provided subagent_id or null
      subagent_id: agentData.super_agent !== null ? agentData.user_id : (data.subagent_id || null),

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
      // Check if user is a counsellor (counsellors cannot update application status)
      const { data: counsellorData, error: counsellorError } = await supabase
        .from('counsellors')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single();

      if (!counsellorError && counsellorData) {
        throw new Error("Counsellors are not allowed to update application status");
      }

      console.error('Error fetching Partner data:', agentError);
      throw new Error(`Failed to fetch Partner data: ${agentError.message}`);
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

        // Check if a transaction already exists for this application
        const { data: existingTransactions, error: transactionCheckError } = await supabase
          .from('transactions')
          .select('*')
          .eq('application_id', applicationId);

        if (transactionCheckError) {
          console.error('Error checking for existing transactions:', transactionCheckError);
          throw new Error(`Failed to check for existing transactions: ${transactionCheckError.message}`);
        }

        if (existingTransactions && existingTransactions.length > 0) {
          // Transaction already exists, update it instead of creating a new one
          const existingTransaction = existingTransactions[0];
          console.log('Found existing transaction, updating instead of creating new one:', existingTransaction.id);

          // Update the existing transaction
          const { data: updatedTransaction, error: updateError } = await supabase
            .from('transactions')
            .update({
              amount: amount, // Update the amount in case it changed
              updated_at: new Date().toISOString(),
              notes: existingTransaction.notes
                ? `${existingTransaction.notes}\n\nUpdated on ${new Date().toLocaleString()}: Application marked as completed again.`
                : "Transaction updated when application was marked as completed again."
            })
            .eq('id', existingTransaction.id)
            .select()
            .single();

          if (updateError) {
            console.error('Error updating existing transaction:', updateError);
            throw new Error(`Failed to update existing transaction: ${updateError.message}`);
          }

          console.log('Successfully updated existing transaction:', updatedTransaction);
        } else {
          // No existing transaction, create a new one
          await createTransaction({
            application_id: applicationId,
            student_name: applicationData.student_name,
            amount: amount,
            subagent_id: applicationData.subagent_id, // This should now be correctly set
            description: `Payment for ${courseName} at ${collegeName}`,
            notes: "Transaction created automatically when application was marked as completed."
          });
          console.log('New transaction created for completed application with amount:', amount);
        }
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

    // For agents, check if application is completed and has a completed transaction
    // If so, restrict what can be edited
    if (applicationData.application_status === APPLICATION_STATUS.COMPLETED) {
      // Check if there's a completed transaction for this application
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('application_id', applicationId)
        .eq('transaction_status', TRANSACTION_STATUS.COMPLETED);

      if (transactionError) {
        console.error('Error checking for completed transactions:', transactionError);
        throw new Error(`Failed to check for completed transactions: ${transactionError.message}`);
      }

      const hasCompletedTransaction = transactions && transactions.length > 0;

      if (hasCompletedTransaction) {
        console.log('Application has completed transaction. Restricting editable fields.');

        // Create a new object with only the allowed fields for completed applications
        const allowedData: ApplicationUpdateInput = {};

        // Student details can be edited
        if (data.student_name !== undefined) allowedData.student_name = data.student_name;
        if (data.email !== undefined) allowedData.email = data.email;
        if (data.phone !== undefined) allowedData.phone = data.phone;

        // Notes can always be updated
        if (data.notes !== undefined) allowedData.notes = data.notes;

        // Documents can be updated
        if (data.document_links !== undefined) allowedData.document_links = data.document_links;

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
          console.error('Error updating application with restricted fields:', error);
          throw new Error(`Failed to update application: ${error.message}`);
        }

        return updatedData;
      }
    }

    // For agents with non-completed applications or without completed transactions, allow updating all fields
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

  // First try to get agent data
  const { data: agentData, error: agentError } = await supabase
    .from('agents')
    .select('super_agent, user_id')
    .eq('user_id', userId)
    .single();

  // If not found in agents table, check if user is a counsellor
  if (agentError) {
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('counsellors')
      .select('agent_id')
      .eq('user_id', userId)
      .single();

    if (counsellorError) {
      throw new Error(`Failed to fetch user data: ${counsellorError.message}`);
    }

    if (!counsellorData) {
      throw new Error("No user record found");
    }

    // For counsellors, get applications from their associated agent
    return getCounsellorApplications(counsellorData.agent_id);
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

/**
 * Gets applications for counsellors based on their associated agent
 * @param agentId The agent ID associated with the counsellor
 * @returns Array of applications
 */
async function getCounsellorApplications(agentId: string) {
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

  // Get all applications where superagent_id equals the agent_id
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('superagent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  let applications = data || [];

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
