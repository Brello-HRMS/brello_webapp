import type { BillingCycle } from '../plans/types';

export interface OrgProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gst_no: string | null;
  domain: string | null;
  registration_no: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
}

export interface OrgEnterprise {
  id: string;
  name: string;
  domain: string;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  enterprise_id: string;
  enterprise: OrgEnterprise;
  profile: OrgProfile | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 'Trial' | 'Active' | 'Grace' | 'Expired' | 'Cancelled';

export interface OrgSubscriptionPlan {
  id: string;
  name: string;
  price_per_employee: number;
}

export interface OrgSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  plan: OrgSubscriptionPlan;
  sub_status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  is_trial: boolean;
  start_date: string;
  end_date: string | null;
  next_renewal_date: string | null;
  status: string;
  created_at: string;
}

export interface OrgStats {
  employee_count: number;
}

export interface OrganizationsResponse {
  data: Organization[];
}

export interface OrganizationResponse {
  data: Organization;
}
