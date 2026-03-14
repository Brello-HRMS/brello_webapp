import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { setupCompany } from './auth';

import type { SetupCompanyRequest, SetupCompanyResponse } from './authType';

export const useSetupCompany = (
  options?: UseMutationOptions<SetupCompanyResponse, Error, SetupCompanyRequest>,
) => {
  return useMutation({
    ...options,
    mutationFn: (data: SetupCompanyRequest) => setupCompany(data),
  });
};
