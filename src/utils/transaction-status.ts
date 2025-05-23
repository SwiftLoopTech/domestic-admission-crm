// Transaction status constants
export const TRANSACTION_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Status colors for UI display
export const TRANSACTION_STATUS_COLORS: Record<string, string> = {
  [TRANSACTION_STATUS.PENDING]: 'bg-yellow-300',
  [TRANSACTION_STATUS.COMPLETED]: 'bg-green-200',
  [TRANSACTION_STATUS.CANCELLED]: 'bg-red-200',
};

// Status descriptions for UI display
export const TRANSACTION_STATUS_DESCRIPTIONS: Record<string, string> = {
  [TRANSACTION_STATUS.PENDING]: 'Transaction is pending completion',
  [TRANSACTION_STATUS.COMPLETED]: 'Transaction has been completed',
  [TRANSACTION_STATUS.CANCELLED]: 'Transaction has been cancelled',
};

// Status workflow - defines which statuses can transition to which other statuses
// This defines the STANDARD workflow that applies to subagents (limited permissions)
export const TRANSACTION_STATUS_WORKFLOW: Record<string, string[]> = {
  [TRANSACTION_STATUS.PENDING]: [], // Subagents can't change transaction status
  [TRANSACTION_STATUS.COMPLETED]: [], // Subagents can't change completed transactions
  [TRANSACTION_STATUS.CANCELLED]: [], // Subagents can't change cancelled transactions
};

// Special workflow for agents only - they have more flexibility
export const AGENT_TRANSACTION_STATUS_WORKFLOW: Record<string, string[]> = {
  [TRANSACTION_STATUS.PENDING]: [TRANSACTION_STATUS.COMPLETED, TRANSACTION_STATUS.CANCELLED],
  [TRANSACTION_STATUS.COMPLETED]: [TRANSACTION_STATUS.PENDING], // Can revert to pending if needed
  [TRANSACTION_STATUS.CANCELLED]: [TRANSACTION_STATUS.PENDING], // Can reactivate if needed
};

// Check if a status transition is valid based on user role
export function isValidTransactionStatusTransition(
  currentStatus: string,
  newStatus: string,
  isAgent: boolean
): boolean {
  const workflow = isAgent
    ? AGENT_TRANSACTION_STATUS_WORKFLOW
    : TRANSACTION_STATUS_WORKFLOW;

  // Get allowed transitions for the current status
  const allowedTransitions = workflow[currentStatus] || [];

  // Check if the new status is in the allowed transitions
  return allowedTransitions.includes(newStatus);
}
