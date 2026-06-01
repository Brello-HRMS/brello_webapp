import type { TemplateDesign } from './designerTypes';

// ─── Shared ───────────────────────────────────────────────────────────────────

export type EntityStatus = 'ACTIVE' | 'INACTIVE';

// ─── Letter Category (L1) ────────────────────────────────────────────────────

export interface LetterCategory {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface LetterCategoryListResponse {
  data: LetterCategory[];
}

export interface CreateLetterCategoryParams {
  name: string;
  description?: string;
}

export interface UpdateLetterCategoryParams {
  name?: string;
  description?: string;
}

// ─── Letter Template (L2) ────────────────────────────────────────────────────

export interface LetterTemplate {
  id: string;
  category_id: string;
  category?: LetterCategory;
  name: string;
  subject?: string;
  description?: string;
  content: string;
  variables: string[];
  design?: TemplateDesign | null;
  is_system: boolean;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface LetterTemplateListResponse {
  data: LetterTemplate[];
}

export interface CreateLetterTemplateParams {
  category_id: string;
  name: string;
  subject?: string;
  description?: string;
  content?: string;
  variables?: string[];
  design?: TemplateDesign;
}

export interface UpdateLetterTemplateParams {
  category_id?: string;
  name?: string;
  subject?: string;
  description?: string;
  content?: string;
  variables?: string[];
  design?: TemplateDesign;
}

// ─── UI-only ─────────────────────────────────────────────────────────────────

export interface TemplateFormData {
  name: string;
  description: string;
  content: string;
}

export const VARIABLE_DISPLAY_LABELS: Record<string, string> = {
  employee_name: 'Employee Name',
  employee_id: 'Employee ID',
  designation: 'Designation',
  department: 'Department',
  joining_date: 'Date of Joining',
  company_name: 'Company Name',
  company_address: 'Employee Address',
  date: 'Date',
  effective_date: 'Effective Date',
  salary_amount: 'Salary Amount',
  salary_currency: 'Currency',
  manager_name: 'Manager Name',
  hr_name: 'Human Resources Team',
};

export const LETTER_VARIABLES: { group: string; vars: string[] }[] = [
  {
    group: 'Employee',
    vars: ['employee_name', 'employee_id', 'designation', 'department', 'joining_date'],
  },
  {
    group: 'Company',
    vars: ['company_name', 'company_address'],
  },
  {
    group: 'Dates',
    vars: ['date', 'effective_date'],
  },
  {
    group: 'Financial',
    vars: ['salary_amount', 'salary_currency'],
  },
  {
    group: 'Management',
    vars: ['manager_name', 'hr_name'],
  },
];

export const VARIABLE_SAMPLE_VALUES: Record<string, string> = {
  employee_name: 'John Doe',
  employee_id: 'EMP-001',
  designation: 'Software Engineer',
  department: 'Engineering',
  joining_date: '01 January 2024',
  company_name: 'Acme Corporation',
  company_address: '123 Business Street, City - 400001',
  date: '31 May 2026',
  effective_date: '01 June 2026',
  salary_amount: '50,000',
  salary_currency: 'INR',
  manager_name: 'Jane Smith',
  hr_name: 'HR Manager',
};
