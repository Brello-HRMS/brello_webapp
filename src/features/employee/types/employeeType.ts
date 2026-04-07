import { Status, SortOrder } from '../../../types/common';

export type EmployeeStatus = Status;

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: EmployeeStatus | string;
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
  annualCtc?: string;
  monthlyGross?: string;
  allowances?: string;
  bonus?: string;
  totalCtc?: string;
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
