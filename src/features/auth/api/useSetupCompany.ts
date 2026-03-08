import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { SetupCompanyRequest, SetupCompanyResponse } from './authType';
import { setupCompany } from './auth';

export const useSetupCompany = (
  options?: UseMutationOptions<SetupCompanyResponse, Error, SetupCompanyRequest>,
) => {
  return useMutation({
    ...options,
    mutationFn: (data: SetupCompanyRequest) => setupCompany(data),
  });
};
