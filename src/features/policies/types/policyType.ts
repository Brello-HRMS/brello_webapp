// ─── Shared ───────────────────────────────────────────────────────────────────

export type PolicyStatus = 'ACTIVE' | 'INACTIVE';

// ─── Policy Types (Categories) ────────────────────────────────────────────────

export interface PolicyType {
  id: string;
  name: string;
  icon: string;
  status: PolicyStatus;
  created_at: string;
  updated_at: string;
}

export interface GetPolicyTypesResponse {
  success: boolean;
  data: PolicyType[];
  timestamp: string;
}

export interface CreatePolicyTypeParams {
  name: string;
  icon: string;
  status?: PolicyStatus;
}

export interface UpdatePolicyTypeParams {
  name?: string;
  icon?: string;
  status?: PolicyStatus;
}

// ─── Policies ─────────────────────────────────────────────────────────────────

export interface Policy {
  id: string;
  title: string;
  description: string;
  type_id: string;
  content: string;
  status: PolicyStatus;
  created_at: string;
  updated_at: string;
  lastUpdated?: string; // derived/display alias
}

export interface PolicyGroup {
  id: string; // policy type id
  name: string; // policy type name
  icon: string; // policy type icon
  iconName?: string; // alias used in Accordion display
  policies: Policy[];
}

export interface GetGroupedPoliciesResponse {
  success: boolean;
  data: PolicyGroup[];
  timestamp: string;
}

export interface GetPolicyByIdResponse {
  success: boolean;
  data: Policy;
  timestamp: string;
}

export interface CreatePolicyParams {
  title: string;
  description: string;
  type_id: string;
  content: string;
  status?: PolicyStatus;
}

export interface UpdatePolicyParams {
  title?: string;
  description?: string;
  content?: string;
  status?: PolicyStatus;
  type_id?: string;
}

// ─── Form data (UI only) ──────────────────────────────────────────────────────

export interface PolicyFormData {
  title: string;
  description: string;
  policyType: string; // maps to type_id
  sortBy: string;
  iconColor: string; // selected icon id in the picker
  content: string;
}
