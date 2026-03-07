import { apiClient } from '../../../lib/axios';

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

/**
 * Registers a new lead.
 */
export const registerLead = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return apiClient.post('/leads/register', data);
};

/**
 * Verifies the OTP for a lead.
 */
export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  return apiClient.post('/leads/verify-otp', data);
};
