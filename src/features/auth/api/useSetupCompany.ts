import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { setupCompany } from './auth';

import type { LoginResponse, SetupCompanyRequest } from './authType';

export const useSetupCompany = (
  options?: UseMutationOptions<LoginResponse, Error, SetupCompanyRequest>,
) => {
  return useMutation({
    ...options,
    mutationFn: (data: SetupCompanyRequest) => setupCompany(data),
  });
};
