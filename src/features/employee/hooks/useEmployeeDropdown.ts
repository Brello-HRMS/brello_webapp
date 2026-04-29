import { useQuery } from '@tanstack/react-query';

import { getEmployeeDropdown } from '../api/employee';

export const useEmployeeDropdown = () => {
  return useQuery({
    queryKey: ['employee-dropdown'],
    queryFn: async () => {
      const response = await getEmployeeDropdown();
      return response;
    },
  });
};
