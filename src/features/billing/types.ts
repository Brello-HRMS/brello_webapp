export enum BillingCycle {
  MONTHLY = 'Monthly',
  ANNUAL = 'Annual',
}

export enum SubscriptionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  CANCELLED = 'Cancelled',
  TRIAL = 'Trial',
  EXPIRED = 'Expired',
}

export enum InvoiceStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  FAILED = 'Failed',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled',
}

// ── Plan / Subscription ───────────────────────────────────────────────────────

export type PlanData = {
  id: string;
  name: string;
  tier_rank: number;
  description: string;
  feature: string[];
  price_per_employee_monthly: number;
  price_per_employee_annual: number;
  annual_discount_percent: number;
  estimated_total_monthly: { subtotal: number; gst_amount: number; total: number };
  estimated_total_annual: { subtotal: number; gst_amount: number; total: number };
  is_current: boolean;
  is_current_cycle: boolean;
  cta: string;
};

export type CurrentSubscription = {
  id: string;
  plan: {
    id: string;
    name: string;
    tier_rank: number;
  };
  billing_cycle: BillingCycle;
  sub_status: string;
  is_trial: boolean;
  start_date: string;
  end_date: string;
  next_renewal_date: string;
  pending_plan_id: string | null;
  pending_billing_cycle: string | null;
  renewal_cta: string;
};

export type TrialData = {
  is_trial: boolean;
  days_remaining: number;
  banner_level: string | null;
};

export type EmployeeBilling = {
  active_employees: number;
  last_snapshot_count: number;
  price_per_employee: number;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  estimated_total: number;
};

export type TimelineEvent = {
  event: string;
  date: string;
  completed: boolean;
};

export type SubscriptionOverviewData = {
  subscription: CurrentSubscription;
  trial: TrialData;
  employee_billing: EmployeeBilling;
  timeline: TimelineEvent[];
  open_invoice_id: string | null;
};

export type SubscriptionResponse = {
  success: boolean;
  data: SubscriptionOverviewData;
  timestamp: string;
};

export type OrgPlansData = {
  cycle: string;
  plans: PlanData[];
};

export type OrgPlansResponse = {
  success: boolean;
  data: OrgPlansData;
  timestamp: string;
};

export type UpgradePlanRequest = {
  plan_id: string;
};

// ── Subscription change ───────────────────────────────────────────────────────

export type ChangePlanRequest = {
  plan_id: string;
  billing_cycle: BillingCycle;
};

export type SubscriptionData = {
  id: string;
  organization_id: string;
  plan_id: string;
  billing_cycle: BillingCycle;
  sub_status: string;
  is_trial: boolean;
  start_date: string;
  end_date: string;
  next_renewal_date: string;
  pending_plan_id: string | null;
  pending_billing_cycle: BillingCycle | null;
  grace_period_ends_at: string | null;
};

export type ChangePlanResult = {
  subscription: SubscriptionData;
  invoice: Invoice | null;
  applied: 'immediate' | 'next_cycle';
};

export type ChangePlanResponse = {
  success: boolean;
  data: ChangePlanResult;
  timestamp: string;
};

export type CancelSubscriptionResponse = {
  success: boolean;
  data: SubscriptionData;
  timestamp: string;
};

// ── Invoice ───────────────────────────────────────────────────────────────────

export type InvoiceLineItem = {
  id: string;
  invoice_id: string;
  line_description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  subscription_id: string;
  plan_id_snapshot: string;
  plan_name_snapshot: string;
  billing_cycle: string;
  billing_profile_snapshot: Record<string, unknown> | null;
  billing_period_start: string;
  billing_period_end: string;
  invoice_date: string;
  due_date: string;
  employee_count_snapshot: number;
  price_per_employee: number;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  invoice_status: InvoiceStatus;
  paid_at: string | null;
  pdf_s3_key: string | null;
  line_items: InvoiceLineItem[];
};

export type InvoiceListData = {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
};

export type SingleInvoiceResponse = {
  success: boolean;
  data: Invoice;
  timestamp: string;
};

export type InvoiceListResponse = {
  success: boolean;
  data: InvoiceListData;
  timestamp: string;
};

export type PdfUrlResponse = {
  success: boolean;
  data: { url: string; expires_in_seconds: number };
  timestamp: string;
};

// ── Payment ───────────────────────────────────────────────────────────────────

export type InitiatePaymentData = {
  payment_id: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount: number; // in paise
  currency: string;
  invoice_number: string;
};

export type InitiatePaymentResponse = {
  success: boolean;
  data: InitiatePaymentData;
  timestamp: string;
};

export type VerifyPaymentData = {
  status: string;
  invoice: Invoice;
  next_renewal_date: string | null;
};

export type VerifyPaymentResponse = {
  success: boolean;
  data: VerifyPaymentData;
  timestamp: string;
};

export type VerifyPaymentRequest = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
