// Commission payment status constants
export const COMMISSION_PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Status colors for UI display
export const COMMISSION_STATUS_COLORS: Record<string, string> = {
  [COMMISSION_PAYMENT_STATUS.PENDING]: 'bg-yellow-300',
  [COMMISSION_PAYMENT_STATUS.COMPLETED]: 'bg-green-200',
  [COMMISSION_PAYMENT_STATUS.CANCELLED]: 'bg-red-200',
};

// Status descriptions for UI display
export const COMMISSION_STATUS_DESCRIPTIONS: Record<string, string> = {
  [COMMISSION_PAYMENT_STATUS.PENDING]: 'Commission payment is pending',
  [COMMISSION_PAYMENT_STATUS.COMPLETED]: 'Commission has been paid',
  [COMMISSION_PAYMENT_STATUS.CANCELLED]: 'Commission payment has been cancelled',
};

// Status workflow - defines which statuses can transition to which other statuses
// Only agents can change commission payment status
export const COMMISSION_STATUS_WORKFLOW: Record<string, string[]> = {
  [COMMISSION_PAYMENT_STATUS.PENDING]: [COMMISSION_PAYMENT_STATUS.COMPLETED, COMMISSION_PAYMENT_STATUS.CANCELLED],
  [COMMISSION_PAYMENT_STATUS.COMPLETED]: [COMMISSION_PAYMENT_STATUS.PENDING], // Can revert if needed
  [COMMISSION_PAYMENT_STATUS.CANCELLED]: [COMMISSION_PAYMENT_STATUS.PENDING], // Can reactivate if needed
};

// Check if a status transition is valid
export function isValidCommissionStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  // Get allowed transitions for the current status
  const allowedTransitions = COMMISSION_STATUS_WORKFLOW[currentStatus] || [];

  // Check if the new status is in the allowed transitions
  return allowedTransitions.includes(newStatus);
}
