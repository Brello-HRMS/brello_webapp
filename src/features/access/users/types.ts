export interface AccessUserRole {
  id: string; // role UUID
  name: string; // role display name
  mappingId: string; // user_role_map record ID (needed for deletion)
}

export interface AccessUser {
  id: string; // user UUID
  firstName: string;
  lastName: string;
  department: string;
  assignedRoles: AccessUserRole[];
}

export interface AssignRolesInput {
  userId: string;
  roleIds: string[];
}
