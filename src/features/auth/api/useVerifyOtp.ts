import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { verifyOtp, type VerifyOtpRequest, type VerifyOtpResponse } from './auth';

export const useVerifyOtp = (
  options?: UseMutationOptions<VerifyOtpResponse, Error, VerifyOtpRequest>,
) => {
  return useMutation({
    mutationFn: verifyOtp,
    ...options,
  });
};
