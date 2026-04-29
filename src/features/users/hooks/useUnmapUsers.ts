import { useMutation, useQueryClient } from '@tanstack/react-query';

import { unmapUsers } from '../api/user';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { UnmapMultipleUsersPayload } from '../types/userType';

export const useUnmapUsers = (
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
        showToast('User Removed successfully', 'success');
      } catch (error) {
        const message = (error as ApiError)?.response?.data?.message || 'Failed to unmap users';
        showToast(message, 'error');
        throw error;
      }
    },
    onSuccess: (...args) => {
      // Refresh the users list and relevant department/designation data
      queryClient.invalidateQueries({ queryKey: ['usersList'] });
      if (options?.onSuccess) {
        options.onSuccess(...args);
      }
    },
    ...options,
  });
};
