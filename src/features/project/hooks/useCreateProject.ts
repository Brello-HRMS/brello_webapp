import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProject } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { CreateProjectParams } from '../types/projectType';
import type { ApiError } from '../../../types/common';

export const useCreateProject = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectParams) => createProject(clientId, data),
    onSuccess: () => {
      showToast('Project created successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['projects', clientId] });
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create project';
      showToast(message, 'error');
    },
  });
};
