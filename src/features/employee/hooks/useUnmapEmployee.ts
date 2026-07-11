import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unmapUsers } from '../api/employee';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { UnmapMultipleUsersPayload } from '../types/employeeType';

export const useUnmapEmployee = (
  options?: Omit<UseMutationOptions<void, Error, UnmapMultipleUsersPayload>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UnmapMultipleUsersPayload) => {
      try {
        await Promise.all(
          payload.userIds.map((userId) =>
            unmapUsers({
              userId,
              unmapDepartment: payload.unmapDepartment,
              unmapDesignation: payload.unmapDesignation,
            }),
          ),
        );
        showToast('Employees removed successfully', 'success');
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to unmap employees';
        showToast(message, 'error');
        throw error;
      }
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      if (options?.onSuccess) {
        options.onSuccess(...args);
      }
    },
    ...options,
  });
};
