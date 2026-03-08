import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetIndustryTypesResponse } from './authType';
import { getIndustryTypes } from './auth';

export const useIndustryTypes = (
  options?: Omit<UseQueryOptions<GetIndustryTypesResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['industryTypes'],
    queryFn: getIndustryTypes,
    ...options,
  });
};
