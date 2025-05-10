import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { COMMISSION_PAYMENT_STATUS } from "@/utils/commission-status";

interface CommissionInput {
  application_id: string;
  transaction_id: string;
  amount: number;
  agent_id: string;
  subagent_id: string;
  notes?: string;
}

interface CommissionUpdateInput {
  payment_status?: string;
  amount?: number;
  notes?: string;
}

/**
 * Create a new commission record when a transaction is completed
 */
export async function createCommission(data: CommissionInput) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    const userId = session.user.id;

    // Determine if user is an agent
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('super_agent')
      .eq('user_id', userId)
      .single();

    if (agentError) {
      console.error('Error fetching agent data:', agentError);
      throw new Error(`Failed to fetch agent data: ${agentError.message}`);
    }

    // Only agents can create commissions
    const isAgent = agentData.super_agent === null;
    if (!isAgent) {
      throw new Error("Only agents can create commission records");
    }

    // Create the commission data object
    const commissionData = {
      id: uuidv4(),
      application_id: data.application_id,
      transaction_id: data.transaction_id,
      amount: data.amount,
      payment_status: COMMISSION_PAYMENT_STATUS.PENDING,
      agent_id: data.agent_id,
      subagent_id: data.subagent_id,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the commission
    const { data: commission, error } = await supabase
      .from('commissions')
      .insert([commissionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating commission:', error);
      throw new Error(`Failed to create commission: ${error.message}`);
    }

    return commission;
  } catch (error: any) {
    console.error('Error in createCommission:', error);
    throw error;
  }
}

/**
 * Update a commission's payment status
 */
export async function updateCommissionStatus({
  commissionId,
  newStatus
}: {
  commissionId: string;
  newStatus: string;
}) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    const userId = session.user.id;

    // Determine if user is an agent
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('super_agent')
      .eq('user_id', userId)
      .single();

    if (agentError) {
      console.error('Error fetching agent data:', agentError);
      throw new Error(`Failed to fetch agent data: ${agentError.message}`);
    }

    // Only agents can update commission status
    const isAgent = agentData.super_agent === null;
    if (!isAgent) {
      throw new Error("Only agents can update commission payment status");
    }

    // Prepare update data
    const updateData: any = {
      payment_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // If status is being set to completed, add completion timestamp
    if (newStatus === COMMISSION_PAYMENT_STATUS.COMPLETED) {
      updateData.payment_completed_at = new Date().toISOString();
    } else {
      // If reverting from completed, clear the completion timestamp
      updateData.payment_completed_at = null;
    }

    // Update the commission
    const { data, error } = await supabase
      .from('commissions')
      .update(updateData)
      .eq('id', commissionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating commission status:', error);
      throw new Error(`Failed to update commission status: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error in updateCommissionStatus:', error);
    throw error;
  }
}

/**
 * Update commission details (amount, notes)
 */
export async function updateCommission(commissionId: string, data: CommissionUpdateInput) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    const userId = session.user.id;

    // Determine if user is an agent
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('super_agent')
      .eq('user_id', userId)
      .single();

    if (agentError) {
      console.error('Error fetching agent data:', agentError);
      throw new Error(`Failed to fetch agent data: ${agentError.message}`);
    }

    // Only agents can update commission details
    const isAgent = agentData.super_agent === null;
    if (!isAgent) {
      throw new Error("Only agents can update commission details");
    }

    // Update the commission
    const { data: updatedData, error } = await supabase
      .from('commissions')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commissionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating commission:', error);
      throw new Error(`Failed to update commission: ${error.message}`);
    }

    return updatedData;
  } catch (error: any) {
    console.error('Error in updateCommission:', error);
    throw error;
  }
}

/**
 * Get all commissions for the current user
 */
export async function getCommissions() {
  try {
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
    let commissions = [];

    if (agentData.super_agent === null) {
      // This is a main agent - get all commissions where agent_id equals their user_id
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('agent_id', agentData.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        throw new Error(`Failed to fetch commissions: ${error.message}`);
      }

      commissions = data || [];
    } else {
      // This is a subagent - get only commissions for this subagent
      const { data, error } = await supabase
        .from('commissions')
        .select('*')
        .eq('subagent_id', agentData.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commissions:', error);
        throw new Error(`Failed to fetch commissions: ${error.message}`);
      }

      commissions = data || [];
    }

    // Manually fetch related transactions and applications data
    if (commissions.length > 0) {
      // Get all transaction IDs
      const transactionIds = commissions.map(comm => comm.transaction_id);

      // Fetch transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .in('id', transactionIds);

      if (transactionsError) {
        console.error('Error fetching related transactions:', transactionsError);
      } else {
        // Create a map of transaction IDs to transaction data
        const transactionMap = new Map();
        transactions.forEach(transaction => {
          transactionMap.set(transaction.id, transaction);
        });

        // Add transaction data to commissions
        commissions = commissions.map(commission => ({
          ...commission,
          transaction: transactionMap.get(commission.transaction_id) || null
        }));
      }

      // Get all application IDs
      const applicationIds = commissions.map(comm => comm.application_id);

      // Fetch applications
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .in('id', applicationIds);

      if (applicationsError) {
        console.error('Error fetching related applications:', applicationsError);
      } else {
        // Create a map of application IDs to application data
        const applicationMap = new Map();
        applications.forEach(application => {
          applicationMap.set(application.id, application);
        });

        // Add application data to commissions
        commissions = commissions.map(commission => ({
          ...commission,
          application: applicationMap.get(commission.application_id) || null
        }));
      }
    }

    return commissions;
  } catch (error: any) {
    console.error('Error in getCommissions:', error);
    throw error;
  }
}
