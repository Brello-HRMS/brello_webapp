export interface Role {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  createdAt: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
}

export interface RolesResponse {
  data: Role[];
  message: string;
  status: string;
}
