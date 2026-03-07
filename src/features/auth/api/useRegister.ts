import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { registerLead, type RegisterRequest, type RegisterResponse } from './auth';

export const useRegister = (
  options?: UseMutationOptions<RegisterResponse, Error, RegisterRequest>,
) => {
  return useMutation({
    mutationFn: registerLead,
    ...options,
  });
};
