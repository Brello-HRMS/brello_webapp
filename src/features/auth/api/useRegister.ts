import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { registerLead } from './auth';

import type { RegisterRequest, RegisterResponse } from './authType';

export const useRegister = (
  options?: UseMutationOptions<RegisterResponse, Error, RegisterRequest>,
) => {
  return useMutation({
    mutationFn: registerLead,
    ...options,
  });
};
