export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface LetterCategory {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateLetterCategoryParams {
  name: string;
  description?: string;
}

export type UpdateLetterCategoryParams = Partial<CreateLetterCategoryParams>;

export interface Signatory {
  id: string;
  organization_id: string;
  name: string;
  designation: string;
  signature_document_id: string | null;
  is_default: boolean;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface LetterSettings {
  organization_id: string;
  letter_prefix: string;
  current_year: number;
  last_sequence: number;
  default_signatory_id: string | null;
  date_format: string;
}

export interface UpdateLetterSettingsParams {
  letter_prefix?: string;
  default_signatory_id?: string;
  date_format?: string;
}

export interface LetterTemplate {
  id: string;
  organization_id: string;
  category_id: string;
  name: string;
  description: string | null;
  heading: string | null;
  paragraphs: string[];
  bullet_list: string[];
  include_salary_table: boolean;
  signatory_id: string | null;
  variables: string[];
  version: number;
  template_status: TemplateStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateLetterTemplateParams {
  category_id: string;
  name: string;
  description?: string;
  heading?: string;
  paragraphs?: string[];
  bullet_list?: string[];
  include_salary_table?: boolean;
  signatory_id?: string;
}

export type UpdateLetterTemplateParams = Partial<CreateLetterTemplateParams>;

export interface SalaryTableModel {
  components: { component_name: string; amount: number | string }[];
  total: number | string;
}

export interface SignatoryModel {
  name: string;
  designation: string;
}

export interface RenderModel {
  heading: string;
  paragraphs: string[];
  bulletList: string[];
  salaryTable: SalaryTableModel | null;
  signatory: SignatoryModel | null;
}

export interface IssuedLetter {
  id: string;
  organization_id: string;
  employee_id: string;
  template_id: string;
  template_version: number;
  category_id: string;
  letter_number: string;
  title: string;
  generated_by: string;
  generated_at: string;
  archived_at: string | null;
}

export interface IssuedLetterFilters {
  employee_id?: string;
  category_id?: string;
  template_id?: string;
  letter_number?: string;
  date_from?: string;
  date_to?: string;
}

export interface GenerateLetterParams {
  employee_id: string;
  template_id: string;
  manual_values?: Record<string, string>;
}

export interface ResolveLetterResponse {
  values: Record<string, string>;
  missing: string[];
  preview: RenderModel;
}

export interface GenerateLetterResponse {
  letterId: string;
  letterNumber: string;
  downloadUrl: string;
}

export interface EmployeeSearchResult {
  id: string;
  name: string;
  profile?: { employee_id?: string } | undefined;
}

export interface VariableDefinition {
  key: string;
  label: string;
  category: string;
  description: string;
  nullable: boolean;
  editable: boolean;
}

export interface VariableGroup {
  category: string;
  variables: VariableDefinition[];
}
