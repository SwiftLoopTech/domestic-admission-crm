import { createSubagent as createSubagentUtil, getSubagents as getSubagentsUtil } from "@/utils/agents.supabase";

export interface SubagentInput {
  name: string;
  email: string;
  password: string; // We keep this for record-keeping, but it's not used for actual authentication
}

/**
 * Gets all subagents for the current authenticated user
 * @returns An array of subagent records
 */
export async function getSubagents() {
  return getSubagentsUtil();
}

/**
 * Creates a new subagent under the current authenticated user
 * @param data The subagent data (name, email, password)
 * @returns The created subagent record
 */
export async function createSubagent(data: SubagentInput) {
  return createSubagentUtil(data);
}