import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type {
  LoginRequest,
  LoginResponse,
  LoginWithOtpRequest,
  VerifyLoginOtpRequest,
} from './authType';
import { login, loginWithOTP, verifyLoginOtp } from './auth';

export const useLogin = (options?: UseMutationOptions<LoginResponse, Error, LoginRequest>) => {
  return useMutation({
    ...options,
    mutationFn: (data: LoginRequest) => login(data),
  });
};

export const useLoginWithOTP = (options?: UseMutationOptions<void, Error, LoginWithOtpRequest>) => {
  return useMutation({
    ...options,
    mutationFn: (data: LoginWithOtpRequest) => loginWithOTP(data),
  });
};

export const useVerifyLoginOtp = (
  options?: UseMutationOptions<LoginResponse, Error, VerifyLoginOtpRequest>,
) => {
  return useMutation({
    ...options,
    mutationFn: (data: VerifyLoginOtpRequest) => verifyLoginOtp(data),
  });
};
