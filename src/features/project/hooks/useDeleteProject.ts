import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProject } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      showToast('Project deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to delete project';
      showToast(message, 'error');
    },
  });
};
