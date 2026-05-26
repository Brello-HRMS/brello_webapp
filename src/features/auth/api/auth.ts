import { envVars } from '../../../utils/envVars';
import { apiClient } from '../../../lib/axios';

import type {
  LoginRequest,
  LoginResponse,
  LoginWithOtpRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyLoginOtpRequest,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  SetupCompanyRequest,
  GetIndustryTypesResponse,
  SwitchAppResponse,
} from './authType';

/**
 * Registers a new lead.
 */
export const registerLead = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/leads/register`, data);
};

/**
 * Verifies the OTP for a lead.
 */
export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/leads/verify-otp`, data);
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/auth/login`, data);
};

export const loginWithOTP = async (data: LoginWithOtpRequest): Promise<void> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/auth/login/send-otp`, data);
};

export const verifyLoginOtp = async (data: VerifyLoginOtpRequest): Promise<LoginResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/auth/login/verify-otp`, data);
};

export const setupCompany = async (data: SetupCompanyRequest): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append('name', data.name);
  if (data.subdomain) {
    formData.append('subdomain', data.subdomain);
  }
  formData.append('website_url', data.website_url);
  formData.append('business_type_id', data.business_type_id);
  formData.append('user_id', data.user_id);
  if (data.logo) {
    formData.append('logo', data.logo);
  }

  return apiClient.post(`${envVars.BRELLO_BASE_API}/organizations/setup`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getIndustryTypes = async (): Promise<GetIndustryTypesResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/industry-types`);
};

export const logout = async (): Promise<void> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/auth/logout`);
};

export const resendOtp = async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/auth/resend-otp`, data);
};

export const switchApp = async (data: { appId: string }): Promise<SwitchAppResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/auth/switch-app`, data);
};
