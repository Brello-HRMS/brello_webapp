import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDepartment } from '../api/department';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreateDepartmentParams } from '../types/departmentType';

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDepartmentParams) => createDepartment(params),
    onSuccess: async () => {
      // Await the refetch (and force ALL cached 'departments' queries, not just the
      // active one) so the newly created department shows without a manual refresh.
      await queryClient.invalidateQueries({ queryKey: ['departments'], refetchType: 'all' });
      showToast('Department created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create department';
      showToast(message, 'error');
    },
  });
};
