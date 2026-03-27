import { useQuery } from '@tanstack/react-query';

import { getProjectTeam } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { GetProjectTeamResponse } from '../types/projectType';

export const useProjectTeam = (projectId?: string) => {
  return useQuery<GetProjectTeamResponse, ApiError>({
    queryKey: ['project-team', projectId],
    queryFn: async () => {
      try {
        const response = await getProjectTeam(projectId!);
        return response;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch project team';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!projectId,
  });
};
