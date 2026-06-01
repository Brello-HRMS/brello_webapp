export enum BillingCycle {
  MONTHLY = 'Monthly',
  ANNUAL = 'Annual',
}

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TRIAL = 'Trial',
  EXPIRED = 'Expired',
}

export type PlanTier = 'standard' | 'premium';

export type CurrentSubscription = {
  plan_id: string;
  plan_name: string;
  plan_description: string;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  active_employees: number;
  price_per_employee: number;
  renewal_date: string | null;
  estimated_renewal: number;
  is_trial: boolean;
  trial_end_date: string | null;
};

export type OrgPlan = {
  id: string;
  name: string;
  tier: PlanTier;
  tagline: string;
  description: string;
  price_per_employee: number;
  features: string[];
  trial_days: number;
};

export type SubscriptionResponse = {
  success: boolean;
  data: CurrentSubscription;
};

export type OrgPlansResponse = {
  success: boolean;
  data: OrgPlan[];
};

export type UpgradePlanRequest = {
  plan_id: string;
};
