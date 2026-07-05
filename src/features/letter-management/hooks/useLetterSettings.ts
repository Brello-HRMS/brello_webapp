import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getLetterSettings, updateLetterSettings } from '../api/letterSettings';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UpdateLetterSettingsParams } from '../types/letterTypes';

export const useLetterSettings = () => {
  return useQuery({
    queryKey: ['letter-settings'],
    queryFn: async () => {
      try {
        const data = await getLetterSettings();
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch letter settings';
        showToast(message, 'error');
        throw error;
      }
    },
  });
};

export const useUpdateLetterSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateLetterSettingsParams) => updateLetterSettings(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-settings'] });
      showToast('Letter settings updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to update letter settings';
      showToast(message, 'error');
    },
  });
};
