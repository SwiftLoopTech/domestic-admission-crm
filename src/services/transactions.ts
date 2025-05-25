import { supabase } from "@/utils/supabase";
import { v4 as uuidv4 } from "uuid";
import { TRANSACTION_STATUS } from "@/utils/transaction-status";
import { createCommission } from "@/services/commissions";

interface TransactionInput {
  application_id: string;
  student_name: string;
  amount: number;
  subagent_id?: string | null;
  description?: string;
  notes?: string;
}

interface TransactionUpdateInput {
  transaction_status?: string;
  notes?: string;
}

/**
 * Create a new transaction when an application is completed
 */
export async function createTransaction(data: TransactionInput) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    const userId = session.user.id;

    // Determine if user is an agent or subagent
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('super_agent, user_id')
      .eq('user_id', userId)
      .single();

    if (agentError) {
      console.error('Error fetching Partner data:', agentError);
      throw new Error(`Failed to fetch Partner data: ${agentError.message}`);
    }

    if (!agentData) {
      throw new Error("No Partner record found for this user");
    }

    // Determine the superagent ID (for partitioning)
    const superAgentId = agentData.super_agent || agentData.user_id;

    // Log the incoming data to verify subagent_id
    console.log('Creating transaction with data:', {
      application_id: data.application_id,
      student_name: data.student_name,
      amount: data.amount,
      subagent_id: data.subagent_id,
      agent_id: superAgentId
    });

    // Create the transaction data object
    const transactionData = {
      id: uuidv4(),
      application_id: data.application_id,
      student_name: data.student_name,
      amount: data.amount,
      transaction_status: TRANSACTION_STATUS.PENDING,
      subagent_id: data.subagent_id || null,
      agent_id: superAgentId, // The main agent is always the owner
      description: data.description || null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert the transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return transaction;
  } catch (error: any) {
    console.error('Error in createTransaction:', error);
    throw error;
  }
}

/**
 * Update a transaction's status
 */
export async function updateTransactionStatus({
  transactionId,
  newStatus
}: {
  transactionId: string;
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
      console.error('Error fetching Partner data:', agentError);
      throw new Error(`Failed to fetch Partner data: ${agentError.message}`);
    }

    // Only agents can update transaction status
    const isAgent = agentData.super_agent === null;
    if (!isAgent) {
      throw new Error("Only Partners can update transaction status");
    }

    // Prepare update data
    const updateData: any = {
      transaction_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // If status is being set to completed, add completion timestamp
    if (newStatus === TRANSACTION_STATUS.COMPLETED) {
      updateData.completed_at = new Date().toISOString();
    } else {
      // If reverting from completed, clear the completion timestamp
      updateData.completed_at = null;
    }

    // Update the transaction
    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction status:', error);
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }

    // If the transaction is being marked as completed, create a commission record
    if (newStatus === TRANSACTION_STATUS.COMPLETED) {
      try {
        // Get the transaction details to access application_id and subagent_id
        const transaction = data;

        // Only create/update commission if there's a subagent involved
        if (transaction.subagent_id) {
          try {
            // Calculate commission amount (default to 10% of transaction amount)
            const commissionAmount = transaction.amount * 0.1;

            // Check if a commission already exists for this transaction
            const { data: existingCommissions, error: commissionCheckError } = await supabase
              .from('commissions')
              .select('*')
              .eq('transaction_id', transaction.id);

            if (commissionCheckError) {
              console.error('Error checking for existing commissions:', commissionCheckError);
              throw new Error(`Failed to check for existing commissions: ${commissionCheckError.message}`);
            }

            if (existingCommissions && existingCommissions.length > 0) {
              // Commission already exists, update it instead of creating a new one
              const existingCommission = existingCommissions[0];
              console.log('Found existing commission, updating instead of creating new one:', existingCommission.id);

              // Update the existing commission
              const { data: updatedCommission, error: updateError } = await supabase
                .from('commissions')
                .update({
                  amount: commissionAmount, // Update the amount in case transaction amount changed
                  updated_at: new Date().toISOString(),
                  notes: existingCommission.notes
                    ? `${existingCommission.notes}\n\nUpdated on ${new Date().toLocaleString()}: Transaction marked as completed again.`
                    : "Commission updated when transaction was marked as completed again."
                })
                .eq('id', existingCommission.id)
                .select()
                .single();

              if (updateError) {
                console.error('Error updating existing commission:', updateError);
                throw new Error(`Failed to update existing commission: ${updateError.message}`);
              }

              console.log('Successfully updated existing commission:', updatedCommission);
            } else {
              // No existing commission, create a new one
              await createCommission({
                application_id: transaction.application_id,
                transaction_id: transaction.id,
                amount: commissionAmount,
                agent_id: transaction.agent_id,
                subagent_id: transaction.subagent_id,
                notes: "Commission created automatically when transaction was marked as completed."
              });
              console.log('New commission created for completed transaction');
            }
          } catch (commissionCreateError) {
            console.error('Error creating/updating commission record:', commissionCreateError);
            // Don't throw here, we still want to return the updated transaction
          }
        }
      } catch (commissionError) {
        console.error('Error creating commission:', commissionError);
        // Don't throw here, we still want to return the updated transaction
        // Just log the error
      }
    }

    return data;
  } catch (error: any) {
    console.error('Error in updateTransactionStatus:', error);
    throw error;
  }
}

/**
 * Update transaction notes
 */
export async function updateTransaction(transactionId: string, data: TransactionUpdateInput) {
  try {
    // Get current user's ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated user found");
    }

    // Update the transaction
    const { data: updatedData, error } = await supabase
      .from('transactions')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return updatedData;
  } catch (error: any) {
    console.error('Error in updateTransaction:', error);
    throw error;
  }
}

/**
 * Get all transactions for the current user
 */
export async function getTransactions() {
  try {
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

    // If user is found in agents table
    if (!agentError && agentData) {
      let transactions = [];

      if (agentData.super_agent === null) {
        // This is a main agent - get all transactions where agent_id equals their user_id
        const { data, error } = await supabase
          .from('transactions')
          .select('*, applications(*)')
          .eq('agent_id', agentData.user_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          throw new Error(`Failed to fetch transactions: ${error.message}`);
        }

        transactions = data || [];
      } else {
        // This is a subagent - get only transactions created by this subagent
        const { data, error } = await supabase
          .from('transactions')
          .select('*, applications(*)')
          .eq('subagent_id', agentData.user_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          throw new Error(`Failed to fetch transactions: ${error.message}`);
        }

        transactions = data || [];
      }

      return transactions;
    }

    // If not found in agents table, check if user is a counsellor
    const { data: counsellorData, error: counsellorError } = await supabase
      .from('counsellors')
      .select('agent_id')
      .eq('user_id', userId)
      .single();

    if (counsellorError) {
      console.error('Error fetching counsellor data:', counsellorError);
      throw new Error(`Failed to fetch user data: ${counsellorError.message}`);
    }

    if (!counsellorData) {
      throw new Error("No user record found in agents or counsellors table");
    }

    // For counsellors, get transactions from their associated agent
    // but only for applications assigned to this counsellor
    const { data, error } = await supabase
      .from('transactions')
      .select('*, applications!inner(*)')
      .eq('agent_id', counsellorData.agent_id)
      .eq('applications.counsellor_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching counsellor transactions:', error);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error in getTransactions:', error);
    throw error;
  }
}
