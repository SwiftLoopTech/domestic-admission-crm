// Application status constants
export const APPLICATION_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
  DOCUMENTS_UPLOADED: 'Documents Uploaded',
  COMPLETED: 'Completed',
};

// Status colors for UI display
export const STATUS_COLORS: Record<string, string> = {
  [APPLICATION_STATUS.PENDING]: 'bg-yellow-300',
  "processing": 'bg-yellow-300', // Legacy status - same color as Pending
  [APPLICATION_STATUS.VERIFIED]: 'bg-blue-200',
  [APPLICATION_STATUS.REJECTED]: 'bg-red-200',
  [APPLICATION_STATUS.DOCUMENTS_UPLOADED]: 'bg-purple-200',
  [APPLICATION_STATUS.COMPLETED]: 'bg-green-200',
};

// Status descriptions
export const STATUS_DESCRIPTIONS: Record<string, string> = {
  [APPLICATION_STATUS.PENDING]: 'Application is awaiting review',
  "processing": 'Application is awaiting review', // Legacy status - same description as Pending
  [APPLICATION_STATUS.VERIFIED]: 'Application has been verified and is ready for document upload',
  [APPLICATION_STATUS.REJECTED]: 'Application has been rejected',
  [APPLICATION_STATUS.DOCUMENTS_UPLOADED]: 'All required documents have been uploaded',
  [APPLICATION_STATUS.COMPLETED]: 'Application process is complete',
};

// Status workflow - defines which statuses can transition to which other statuses
// This defines the STANDARD workflow that applies to subagents (limited permissions)
export const STATUS_WORKFLOW: Record<string, string[]> = {
  [APPLICATION_STATUS.PENDING]: [], // Subagents can't change from pending
  "processing": [], // Subagents can't change from processing
  [APPLICATION_STATUS.VERIFIED]: [APPLICATION_STATUS.DOCUMENTS_UPLOADED], // Subagents can only mark as documents uploaded
  [APPLICATION_STATUS.REJECTED]: [],
  [APPLICATION_STATUS.DOCUMENTS_UPLOADED]: [], // Subagents can't change after documents uploaded
  [APPLICATION_STATUS.COMPLETED]: [],
};

// Special workflow for agents only - they have more flexibility
export const AGENT_STATUS_WORKFLOW: Record<string, string[]> = {
  [APPLICATION_STATUS.PENDING]: [APPLICATION_STATUS.VERIFIED, APPLICATION_STATUS.REJECTED],
  "processing": [APPLICATION_STATUS.VERIFIED, APPLICATION_STATUS.REJECTED], // Legacy status
  [APPLICATION_STATUS.VERIFIED]: [APPLICATION_STATUS.DOCUMENTS_UPLOADED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.REJECTED]: [APPLICATION_STATUS.VERIFIED, APPLICATION_STATUS.PENDING],
  [APPLICATION_STATUS.DOCUMENTS_UPLOADED]: [APPLICATION_STATUS.COMPLETED, APPLICATION_STATUS.VERIFIED], // Can revert to Verified
  [APPLICATION_STATUS.COMPLETED]: [APPLICATION_STATUS.DOCUMENTS_UPLOADED, APPLICATION_STATUS.VERIFIED], // Can revert if needed
};

// Check if a status transition is valid based on user role
export function isValidStatusTransition(currentStatus: string, newStatus: string, isAgent: boolean = false): boolean {
  // Agents have more flexibility in status transitions
  if (isAgent) {
    return AGENT_STATUS_WORKFLOW[currentStatus]?.includes(newStatus) || false;
  }

  // Standard workflow for subagents
  return STATUS_WORKFLOW[currentStatus]?.includes(newStatus) || false;
}
