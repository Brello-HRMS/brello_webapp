export interface PlatformRole {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  app_id: string;
  app?: { id: string; name: string; icon: string | null };
  is_system_role: boolean;
  is_default: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePlatformRoleRequest {
  name: string;
  app_id: string;
  description?: string;
  code?: string;
  is_system_defined?: boolean;
}

export interface UpdatePlatformRoleRequest {
  name?: string;
  description?: string;
  code?: string;
  is_system_defined?: boolean;
}
