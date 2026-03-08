import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { RegisterRequest, RegisterResponse } from './authType';
import { registerLead } from './auth';

export const useRegister = (
  options?: UseMutationOptions<RegisterResponse, Error, RegisterRequest>,
) => {
  return useMutation({
    mutationFn: registerLead,
    ...options,
  });
};
