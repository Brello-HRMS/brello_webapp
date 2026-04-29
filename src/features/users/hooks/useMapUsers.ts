import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mapUsers } from '../api/user';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { MapMultipleUsersPayload } from '../types/userType';

export const useMapUsers = (
  options?: Omit<UseMutationOptions<void, Error, MapMultipleUsersPayload>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MapMultipleUsersPayload) => {
      try {
        await Promise.all(
          payload.userIds.map((userId) =>
            mapUsers({
              userId,
              departmentId: payload.departmentId,
              designationId: payload.designationId,
            }),
          ),
        );
        showToast('User Added successfully', 'success');
      } catch (error) {
        const message = (error as ApiError)?.response?.data?.message || 'Failed to map users';
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
