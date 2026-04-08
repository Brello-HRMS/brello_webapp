export type PayrollFrequency = 'monthly';

export type ComponentType = 'earning' | 'deduction';

export type CalculationType = 'fixed' | 'percentage' | 'residual';

export type ComponentStatus = 'Active' | 'Inactive';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: ComponentType;
  calculation_type: CalculationType;
  calculation_value?: {
    value?: number;
    base?: string;
  };
  is_taxable: boolean;
  is_active: boolean;
  is_system_defined: boolean;
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
  frequency: PayrollFrequency;
  start_date: string;
  cutoff_day: number;
  payout_day: number;
  payslip_release_day: number;
}

export interface StatutoryPFConfig {
  employee_contribution: number;
  employer_contribution: number;
  min_salary_threshold: number;
  wage_ceiling?: number;
  salary_ceiling_enabled: boolean;
}

export interface AddComponentFormData {
  name: string;
  type: ComponentType;
  calculationType: CalculationType;
  amount: number | string;
  parentComponentId?: string;
  taxable: boolean;
  status: boolean;
}

export interface CreateTemplateFormData {
  name: string;
  description: string;
  componentIds: string[];
  status: boolean;
}
