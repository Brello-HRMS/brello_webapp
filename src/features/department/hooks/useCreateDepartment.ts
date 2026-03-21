import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDepartment } from '../api/department';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreateDepartmentParams } from '../types/departmentType';

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDepartmentParams) => createDepartment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showToast('Department created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create department';
      showToast(message, 'error');
    },
  });
};
