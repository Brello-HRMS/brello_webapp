export enum ReimbursementStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface ReimbursementAttachment {
  id: string;
  reimbursement_id: string;
  document_id: string;
  original_name?: string;
  url?: string;
  created_at: string;
}

export interface ReimbursementEmployee {
  id: string;
  name: string;
  employee_code: string | null;
}

export interface Reimbursement {
  id: string;
  employee_id: string;
  employee?: ReimbursementEmployee;
  title: string;
  expense_description: string | null;
  expense_date: string;
  amount: number;
  currency: string;
  reimb_status: ReimbursementStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  is_paid: boolean;
  paid_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  attachments: ReimbursementAttachment[];
}

export type ReimbursementStatusString = `${ReimbursementStatus}`;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedReimbursements {
  items: Reimbursement[];
  pagination: PaginationMeta;
}

export interface CreateReimbursementPayload {
  title: string;
  expense_description?: string;
  expense_date: string;
  amount: number;
  document_ids: string[];
}

export interface UpdateReimbursementPayload {
  title?: string;
  expense_description?: string;
  expense_date?: string;
  amount?: number;
  add_document_ids?: string[];
  remove_document_ids?: string[];
  version: number;
}

export interface AdminUpdateStatusPayload {
  status: ReimbursementStatus.APPROVED | ReimbursementStatus.REJECTED;
  rejection_reason?: string;
}

export interface EmployeeReimbursementQuery {
  status?: ReimbursementStatusString;
  is_paid?: boolean;
  from_date?: string;
  to_date?: string;
  sort?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminReimbursementQuery extends EmployeeReimbursementQuery {
  employee_id?: string;
}

export interface AddReimbursementFormData {
  title: string;
  expense_description: string;
  expense_date: string;
  amount: string;
}

export interface EditStatusFormData {
  status: 'Approved' | 'Rejected' | 'Pending';
  rejection_reason: string;
  is_paid: boolean;
}
