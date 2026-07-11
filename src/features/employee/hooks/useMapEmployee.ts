import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mapUsers } from '../api/employee';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { MapMultipleUsersPayload } from '../types/employeeType';

export const useMapEmployee = (
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
        showToast('Employees mapped successfully', 'success');
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to map employees';
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
