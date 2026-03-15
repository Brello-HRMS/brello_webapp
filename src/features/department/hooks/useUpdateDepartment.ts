import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateDepartment } from '../api/department';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UpdateDepartmentParams } from '../types/departmentType';

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateDepartmentParams }) =>
      updateDepartment(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showToast('Department updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Failed to update department';
      showToast(message, 'error');
    },
  });
};
