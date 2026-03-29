import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createProject, addTeamMembers } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { CreateProjectParams } from '../types/projectType';
import type { ApiError } from '../../../types/common';

export const useCreateProject = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectParams) => {
      const { team, contracts: _contracts, ...rest } = data;
      const response = await createProject(clientId, rest);
      const project = response.data;

      if (team && team.length > 0) {
        await addTeamMembers(project.id, {
          members: team.map((member) => ({
            user_id: member.user_id,
            role: member.role,
          })),
        });
      }

      return project;
    },
    onSuccess: () => {
      showToast('Project created successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['projects', clientId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to create project';
      showToast(message, 'error');
    },
  });
};
