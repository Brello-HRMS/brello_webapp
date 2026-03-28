import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addTeamMembers } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { AddTeamMembersParams } from '../types/projectType';
import type { ApiError } from '../../../types/common';

export const useAddProjectTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AddTeamMembersParams }) =>
      addTeamMembers(projectId, data),
    onSuccess: (_, { projectId }) => {
      showToast('Team assigned successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to assign team';
      showToast(message, 'error');
    },
  });
};
