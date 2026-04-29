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
