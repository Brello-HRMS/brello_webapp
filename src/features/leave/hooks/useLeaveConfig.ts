import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  getCurrentLeaveConfig,
  createLeaveConfigDraft,
  updateLeaveConfig,
  activateLeaveConfig,
} from '../../../api/leaveConfig';

import type { LeaveConfigFormValues } from '../schemas/leaveConfig.schema';
import type { ApiError } from '../../../types/common';

export const useLeaveConfigQuery = () => {
  return useQuery({
    queryKey: ['leaveConfig', 'current'],
    queryFn: async () => {
      try {
        const response = await getCurrentLeaveConfig();
        return response.data;
      } catch (error) {
        if ((error as ApiError).response?.data?.message) {
          return null; // Return null if configuration does not exist yet
        }
        throw error;
      }
    },
    retry: false,
  });
};

export const useSaveLeaveConfigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      configId,
      data,
    }: {
      configId: string | null;
      data: LeaveConfigFormValues;
    }) => {
      let currentId = configId;

      // 1. Create draft if it doesn't exist
      if (!currentId) {
        const createRes = await createLeaveConfigDraft({ totalLeave: data.totalLeave });
        currentId = createRes.data.id;
      }

      // 2. Update config
      if (currentId) {
        await updateLeaveConfig(currentId, {
          totalLeave: data.totalLeave,
          leaveTypes: data.leaveTypes,
          rules: data.rules,
        });

        // 3. Activate config
        await activateLeaveConfig(currentId);
      }
      return currentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveConfig', 'current'] });
      toast.success('Leave configuration saved successfully');
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to save configuration';
      toast.error(message);
    },
  });
};
