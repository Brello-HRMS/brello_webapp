import { Status, SortOrder } from '../../../types/common';

export type EmployeeStatus = Status;

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: EmployeeStatus | string;
  employeeStatus?: string | null;
  avatar: string | null;
  memberAvatars: string[];

  // Fallback fields per user request, API currently doesn't provide them
  department?: string;
  type?: string;
  location?: string;
  role?: string;
}

export interface GetEmployeesResponse {
  success: boolean;
  data: {
    data: Employee[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface GetEmployeesParams {
  status?: EmployeeStatus | string;
  sort_by?: string;
  sort_order?: SortOrder | string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  middleName?: string;
  phone?: string;
}

export interface EmploymentDetailsDto {
  departmentId?: string;
  designationId?: string;
  reportsTo?: string;
  employmentDate?: string;
  joiningDate?: string;
  workLocation?: string;
  probationPeriod?: string;
  notes?: string;
}

export interface PayrollDetailsDto {
  taxRegime?: string;
  gov_info?: {
    pan?: string;
    uan?: string;
  };
  bank_info?: {
    accountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };
}

export interface SystemAccessDto {
  roleId?: string;
  assignedAssets?: string[];
}

export interface EducationDto {
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  completionDate: string;
  completionYear: string;
}

export interface ExperienceDto {
  company: string;
  designation: string;
  fromDate: string;
  isCurrent: boolean;
  description?: string;
}

export enum UserType {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export enum WorkLocation {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

// ─── Employee Detail types (GET /employees/:id) ────────────────────────────

export interface EmployeeProfile {
  employeeId: string | null;
  type: string;
  dob: string | null;
  gender: string | null;
  joiningDate: string | null;
  noticePeriod: number | null;
  currentSalary: string | null;
  /** Employment type (FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP) */
  employmentType?: string | null;
  /** Work model (ONSITE | REMOTE | HYBRID) */
  workModel?: string | null;
  /** Department name (resolved separately if available) */
  department?: string | null;
  /** Address string */
  address?: string | null;
  /** Annual CTC */
  annualCtc?: string | null;
  /** Monthly gross */
  monthlyGross?: string | null;
  /** Allowances */
  allowances?: string | null;
  /** Total CTC */
  totalCtc?: string | null;
  /** Tax regime */
  taxRegime?: string | null;
  /** Designation / job title */
  designation?: string | null;
}

export interface EducationItem {
  id: string;
  school_name: string;
  degree: string;
  field_of_study: string;
  completion_date: string | null;
  completion_year: string | null;
  additional_detail: string | null;
  user_profile_id: string;
  status: string;
  created_at: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  designation: string;
  from_date: string;
  to_date: string | null;
  is_current: boolean;
  description: string | null;
  user_profile_id: string;
  status: string;
  created_at: string;
}

export interface AssetItem {
  id: string;
  name: string;
  user_profile_id: string;
  status: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  doc_id: string;
  user_profile_id: string;
  status: string;
}

export interface BankInfo {
  id: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  user_profile_id: string;
}

export interface GovInfo {
  id: string;
  uan: string | null;
  aadhaar: string | null;
  pan: string | null;
  esi: string | null;
  passport: string | null;
  driving_licence: string | null;
  user_profile_id: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface EmployeeDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  reportsTo: string | null;
  avatar: string | null;
  profile: EmployeeProfile;
  education: EducationItem[];
  experience: ExperienceItem[];
  assets: AssetItem[];
  documents: DocumentItem[];
  bankInfo: BankInfo | null;
  govInfo: GovInfo | null;
  emergencyContact: EmergencyContact[];
}

export interface GetEmployeeDetailResponse {
  success: boolean;
  data: EmployeeDetail;
  timestamp: string;
}
