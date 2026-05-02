export interface Role {
  id: string;
  name: string;
  description: string;
  app_id?: string;
  updatedAt: string;
  createdAt: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
  app_id?: string;
}

export interface RolesResponse {
  data: Role[];
  message: string;
  status: string;
}
