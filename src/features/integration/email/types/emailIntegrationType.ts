import type { ApiResponse } from '../../../../types/common';

export type EmailProvider = 'gmail';

export interface EmailIntegration {
  id: string;
  provider: EmailProvider;
  email: string;
  display_name: string | null;
  is_active: boolean;
  status: string;
  last_used_at: string | null;
  connected_by: string | null;
  created_at: string;
}

export type GetEmailIntegrationsResponse = ApiResponse<EmailIntegration[]>;
export type GetGoogleAuthUrlResponse = ApiResponse<{ url: string }>;
export type TestEmailResponse = ApiResponse<{ sent: boolean; to: string }>;
