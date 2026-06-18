export interface User {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  designationId: string | null;
  departmentId: string | null;
}

export interface GetUsersResponse {
  message: string;
  data: User[];
}

export interface MapUsersPayload {
  userId: string;
  departmentId?: string;
  designationId?: string;
}

export interface MapMultipleUsersPayload {
  userIds: string[];
  departmentId?: string;
  designationId?: string;
}

export interface UnmapUserPayload {
  userId: string;
  unmapDepartment?: boolean;
  unmapDesignation?: boolean;
}

export interface UnmapMultipleUsersPayload {
  userIds: string[];
  unmapDepartment?: boolean;
  unmapDesignation?: boolean;
}

export interface UserProfilePhoto {
  bucket: string;
  object_key: string;
}

export interface UserProfileDetails {
  id: string;
  enterprise_id: string;
  organization_id: string;
  status: string;
  type: string;
  email: string;
  employee_status: string;
  joining_date: string | null;
  work_location: string | null;
  probation_period: string | null;
  notice_period: number | null;
  tax_regime: string | null;
  photo?: UserProfilePhoto | null;
}

export interface UserDesignation {
  id: string;
  enterprise_id: string;
  organization_id: string;
  status: string;
  code: string | null;
  description: string | null;
  title: string;
  is_deleted: boolean;
  is_default: boolean;
}

export interface UserDetailsResponse {
  id: string;
  enterprise_id: string;
  organization_id: string;
  status: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  is_platform_admin: boolean;
  reports_to_id: string | null;
  department_id: string | null;
  designation_id: string | null;
  designation?: UserDesignation | null;
  user_profile_id: string | null;
  user_profile?: UserProfileDetails | null;
  plan_id: string | null;
}
