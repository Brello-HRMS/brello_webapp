import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { verifyOtp } from './auth';

import type { VerifyOtpRequest, VerifyOtpResponse } from './authType';

export const useVerifyOtp = (
  options?: UseMutationOptions<VerifyOtpResponse, Error, VerifyOtpRequest>,
) => {
  return useMutation({
    mutationFn: verifyOtp,
    ...options,
  });
};
