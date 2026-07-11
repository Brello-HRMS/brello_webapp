// ── Enums ────────────────────────────────────────────────────────────────────

export type OfferStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'VIEWED'
  | 'NEGOTIATING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN'
  | 'SYNCED';

export type OfferTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type OfferApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'CONSULTANT';

export type WorkMode = 'ONSITE' | 'REMOTE' | 'HYBRID';

// ── Entities ─────────────────────────────────────────────────────────────────

export interface OfferTemplate {
  id: string;
  organization_id: string;
  name: string;
  body: string | null;
  variables: string[];
  version: number;
  template_status: OfferTemplateStatus;
  signatory_id: string | null;
  include_salary_table: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferCandidate {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  current_company: string | null;
  current_designation: string | null;
  experience_years: number | null;
  applied_for: string | null;
  resume_url: string | null;
  recruiter_id: string | null;
  recruiter_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryComponent {
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
}

export interface Offer {
  id: string;
  organization_id: string;
  candidate_id: string;
  candidate?: OfferCandidate;
  offer_number: string | null;
  offer_status: OfferStatus;
  current_version: number;
  template_id: string | null;
  position: string | null;
  department_id: string | null;
  designation_id: string | null;
  employment_type: EmploymentType | null;
  joining_date: string | null;
  reporting_manager_id: string | null;
  work_mode: WorkMode | null;
  work_location: string | null;
  office_address: string | null;
  probation_days: number | null;
  notice_period_days: number | null;
  salary_structure_id: string | null;
  ctc_annual: number | null;
  monthly_take_home: number | null;
  salary_components: SalaryComponent[];
  policy_ids: string[];
  expiry_days: number;
  sent_at: string | null;
  expires_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  withdrawn_at: string | null;
  synced_at: string | null;
  synced_employee_id: string | null;
  rejection_reason: string | null;
  candidate_comment: string | null;
  requires_approval: boolean;
  current_approval_step: number | null;
  created_at: string;
  updated_at: string;
}

export interface OfferVersion {
  id: string;
  offer_id: string;
  version_number: number;
  is_active: boolean;
  change_summary: string | null;
  access_token: string;
  token_expires_at: string | null;
  pdf_url: string | null;
  viewed_at: string | null;
  candidate_response: 'accepted' | 'rejected' | 'changes_requested' | null;
  responded_at: string | null;
  negotiation_request: NegotiationRequest | null;
  created_at: string;
}

export interface NegotiationRequest {
  expected_salary?: number;
  preferred_joining_date?: string;
  comments: string;
  attachments?: string[];
}

export interface OfferTimeline {
  id: string;
  offer_id: string;
  event: string;
  label: string;
  metadata: Record<string, unknown> | null;
  actor_id: string | null;
  actor_name: string | null;
  created_at: string;
}

export interface OfferApprovalStep {
  id: string;
  offer_id: string;
  role_name: string;
  approver_id: string;
  step_order: number;
  approval_status: OfferApprovalStatus;
  comment: string | null;
  actioned_at: string | null;
}

export interface OfferDocument {
  id: string;
  offer_id: string;
  document_type: string;
  file_url: string;
  original_filename: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  uploaded_by_candidate: boolean;
  created_at: string;
}

export interface OfferMessage {
  id: string;
  offer_id: string;
  sender_type: 'hr' | 'candidate';
  sender_id: string | null;
  sender_name: string;
  message: string;
  attachments: string[];
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface OfferSettings {
  id: string;
  organization_id: string;
  offer_prefix: string;
  offer_expiry_days: number;
  reminder_days_before_expiry: number[];
  default_template_id: string | null;
  default_signatory_id: string | null;
  allow_download: boolean;
  enable_request_changes: boolean;
  enable_digital_signature: boolean;
  auto_welcome_email: boolean;
  approval_chain: Array<{ role_name: string; requires_at_ctc_above?: number }>;
  last_sequence: number;
  sequence_year: number;
}

export interface OfferAnalytics {
  total: number;
  by_status: Partial<Record<OfferStatus, number>>;
  acceptance_rate: number;
  negotiation_rate: number;
  avg_acceptance_days: number | null;
}

// ── Portal types ──────────────────────────────────────────────────────────────

export interface OfferPortalData {
  offer: Offer;
  version: OfferVersion;
  candidate: OfferCandidate;
}

// ── Params ────────────────────────────────────────────────────────────────────

export interface CreateOfferTemplateParams {
  name: string;
  body?: string;
  signatory_id?: string;
  include_salary_table?: boolean;
}

export type UpdateOfferTemplateParams = Partial<CreateOfferTemplateParams>;

export interface OfferTemplateFilters {
  template_status?: OfferTemplateStatus;
  search?: string;
}

export interface CreateOfferCandidateParams {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  current_company?: string;
  current_designation?: string;
  experience_years?: number;
  applied_for?: string;
  recruiter_id?: string;
  recruiter_notes?: string;
}

export type UpdateOfferCandidateParams = Partial<CreateOfferCandidateParams>;

export interface CandidateFilters {
  search?: string;
  recruiter_id?: string;
}

export interface OfferDetailsParams {
  position?: string;
  department_id?: string;
  designation_id?: string;
  employment_type?: EmploymentType;
  joining_date?: string;
  reporting_manager_id?: string;
  work_mode?: WorkMode;
  work_location?: string;
  office_address?: string;
  probation_days?: number;
  notice_period_days?: number;
}

export interface OfferCompensationParams {
  salary_structure_id?: string;
  ctc_annual?: number;
  monthly_take_home?: number;
  salary_components?: SalaryComponent[];
}

export interface CreateOfferParams {
  candidate_id: string;
  template_id?: string;
  details?: OfferDetailsParams;
  compensation?: OfferCompensationParams;
  policy_ids?: string[];
}

export type UpdateOfferParams = Partial<CreateOfferParams>;

export interface OfferFilters {
  offer_status?: OfferStatus;
  candidate_id?: string;
  page?: number;
  limit?: number;
}

export interface SendOfferParams {
  change_summary?: string;
}

export interface WithdrawOfferParams {
  reason: string;
}

export interface ExtendExpiryParams {
  extra_days: number;
}

export interface UpdateOfferSettingsParams {
  offer_prefix?: string;
  offer_expiry_days?: number;
  reminder_days_before_expiry?: number[];
  default_template_id?: string;
  default_signatory_id?: string;
  allow_download?: boolean;
  enable_request_changes?: boolean;
  enable_digital_signature?: boolean;
  auto_welcome_email?: boolean;
  approval_chain?: Array<{ role_name: string; requires_at_ctc_above?: number }>;
}

// ── Wizard State ──────────────────────────────────────────────────────────────

export interface OfferWizardState {
  step: number;
  candidate_id: string;
  template_id?: string;
  details: OfferDetailsParams;
  compensation: OfferCompensationParams;
  policy_ids: string[];
}
