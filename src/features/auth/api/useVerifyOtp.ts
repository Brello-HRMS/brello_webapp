import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { VerifyOtpRequest, VerifyOtpResponse } from './authType';
import { verifyOtp } from './auth';

export const useVerifyOtp = (
  options?: UseMutationOptions<VerifyOtpResponse, Error, VerifyOtpRequest>,
) => {
  return useMutation({
    mutationFn: verifyOtp,
    ...options,
  });
};
