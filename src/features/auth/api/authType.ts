export type RegisterRequest = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  plan_id: string;
  location?: string;
  device?: string;
  source?: string;
};

// Update this according to your actual API response
export type RegisterResponse = {
  message: string;
  data?: unknown;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

// Update this according to your actual API response
export type VerifyOtpResponse = {
  message: string;
  data?: unknown;
};

export type ResendOtpRequest = {
  email: string;
  purpose:
    | 'LOGIN'
    | 'RESET_PASSWORD'
    | 'VERIFY_PHONE'
    | 'VERIFY_EMAIL'
    | 'TWO_FACTOR_AUTH'
    | 'PLATFORM_ADMIN_REGISTER'
    | 'PLATFORM_ADMIN_LOGIN'
    | 'LEAD_VERIFICATION';
};

export type ResendOtpResponse = {
  success: boolean;
  message: string;
  timestamp?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  device_fingerprint?: string;
};

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  enterprise_id: string | null;
  organization_id: string | null;
};

export type Apps = {
  id: string;
  name: string;
  priority: number;
};

export type LoginData = {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
  defaultAppId: string;
  availableApps: Apps[];
  setup_required: boolean;
};

export type LoginResponse = {
  success: boolean;
  data: LoginData;
  timestamp: string;
};

export type LoginWithOtpRequest = {
  email: string;
};

export type VerifyLoginOtpRequest = {
  email: string;
  otp: string;
  device_fingerprint: string;
};

export type SetupCompanyRequest = {
  name: string;
  subdomain: string;
  business_type_id: string;
  user_id: string;
};

export type SetupCompanyResponse = {
  success: boolean;
  data: {
    success: boolean;
    message: string;
    setup_required: boolean;
  };
  timestamp: string;
};

export type IndustryType = {
  id: string;
  enterprise_id: string | null;
  organization_id: string | null;
  status: string;
  code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  modified_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
  name: string;
};

export type GetIndustryTypesResponse = {
  success: boolean;
  data: IndustryType[];
  timestamp: string;
};
