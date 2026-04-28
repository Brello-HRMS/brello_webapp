export type PayrollFrequency = 'monthly';
export type ComponentType = 'earning' | 'deduction' | 'bonus';
export type ComponentCategory = 'fixed' | 'variable' | 'statutory';
export type CalculationType = 'fixed' | 'percentage' | 'residual';
export type PayoutType = 'last_working_day' | 'first_working_day' | 'custom';
export type PayoutDayShift = 'previous' | 'next';
export type AttendanceCutoffType = 'days_before_month_end' | 'fixed_date';
export type FinancialMonth =
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  component_type: ComponentType;
  category: ComponentCategory;
  calculation_type: CalculationType;
  calculate_from?: string | null;
  base_component?: { id: string; name: string } | null;
  value?: number | null;
  is_taxable: boolean;
  is_residual: boolean;
  is_default: boolean;
  is_editable: boolean;
  is_active: boolean;
  calculation_priority: number;
}

export interface SalaryTemplateComponent {
  component_id: string;
  override_config?: Record<string, unknown>;
  sort_order: number;
  component?: SalaryComponent;
}

export interface SalaryTemplate {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  components: SalaryTemplateComponent[];
}

export interface PayrollCycleConfig {
  financial_start_month: FinancialMonth;
  payout_type: PayoutType;
  payout_date?: number | null;
  payout_day_shift?: PayoutDayShift | null;
  consider_holidays: boolean;
  attendance_cutoff_type: AttendanceCutoffType;
  attendance_cutoff_value: number;
}

export interface StatutoryPFConfig {
  employee_contribution: number;
  employer_contribution: number;
  minimum_salary_threshold: number;
  is_enabled: boolean;
  effective_from: string;
}

export interface AddComponentFormData {
  name: string;
  componentType: ComponentType;
  category: ComponentCategory;
  calculationType: CalculationType;
  value: number | string;
  calculateFrom?: string;
  taxable: boolean;
  status: boolean;
}

export interface CreateTemplateFormData {
  name: string;
  description: string;
  componentIds: string[];
  status: boolean;
}

// --- Employee Payroll ---

export interface EmployeeWithSalary {
  id: string;
  name: string;
  employee_code?: string | null;
  department?: string | null;
  annual_ctc?: number | null;
  monthly_ctc?: number | null;
  gross?: number | null;
  deductions?: number | null;
  take_home?: number | null;
}

export interface EmployeeListResponse {
  data: EmployeeWithSalary[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeSalaryComponent {
  id?: string;
  component_name: string;
  component_type: ComponentType;
  value: number;
  calculation_type: CalculationType;
  calculate_from?: string | null;
  is_residual: boolean;
  calculation_priority: number;
}

export interface EmployeeSalaryStructure {
  employee: {
    name: string;
    employee_code?: string | null;
    department?: string | null;
  };
  ctc: number;
  version?: number | null;
  effective_from?: string;
  components: EmployeeSalaryComponent[];
}

export interface EmployeeSalaryInfo {
  id: string;
  version_number: number;
  ctc: number;
  effective_from: string;
  effective_to?: string | null;
  is_active: boolean;
  components: EmployeeSalaryComponent[];
}

export interface AssignSalaryPayload {
  user_id: string;
  template_id: string;
  ctc: number;
  effective_from: string;
  component_ids?: string[];
  overrides?: Record<string, number>;
}

export interface AssignSalaryFormData {
  templateId: string;
  ctc: number | string;
  effectiveFrom: string;
}

// --- Dry Run ---

export interface DryRunPayload {
  template_id: string;
  ctc: number;
  bonus?: number;
  loan_emi?: number;
  lwp_days?: number;
  other_deductions?: number;
  component_ids?: string[];
  overrides?: Record<string, number>;
}

export interface DryRunFormData {
  templateId: string;
  ctc: number | string;
  bonus?: number | string;
  loanEmi?: number | string;
  lwpDays?: number | string;
  otherDeductions?: number | string;
}

export interface DryRunLineItem {
  name: string;
  type: string;
  value: number;
  calculated_value: number;
}

export interface DryRunResult {
  earnings: DryRunLineItem[];
  deductions: DryRunLineItem[];
  gross: number;
  deductions_total: number;
  net: number;
  employer_contribution?: number;
  warnings?: string[];
  metadata: {
    template_name: string;
    simulated_at: string;
    currency: string;
    sample_period: string;
  };
}
