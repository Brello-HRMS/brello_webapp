import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { resendOtp } from './auth';

import type { ResendOtpRequest, ResendOtpResponse } from './authType';

export const useResendOtp = (
  options?: UseMutationOptions<ResendOtpResponse, Error, ResendOtpRequest>,
) => {
  return useMutation({
    mutationFn: resendOtp,
    ...options,
  });
};
