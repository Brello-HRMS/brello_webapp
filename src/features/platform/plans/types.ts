import { Status } from '../../../types/common';

export enum BillingCycle {
  MONTHLY = 'Monthly',
  ANNUAL = 'Annual',
}

export type Plan = {
  id: string;
  name: string;
  price: number;
  price_per_employee_annual: number;
  annual_discount_percent: number;
  tier_rank: number;
  billing_cycle_default: BillingCycle;
  description: string | null;
  discount: number;
  feature: string[];
  status: Status;
  created_at: string;
  updated_at: string;
};

export type PlansResponse = {
  success: boolean;
  data: Plan[];
  timestamp: string;
};

export type CreatePlanRequest = {
  name: string;
  price: number;
  price_per_employee_annual?: number;
  annual_discount_percent?: number;
  tier_rank?: number;
  billing_cycle_default?: BillingCycle;
  description?: string;
  discount?: number;
  feature?: string[];
};

export type UpdatePlanRequest = Partial<CreatePlanRequest>;
