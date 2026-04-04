import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addTeamMembers, updateProject, uploadProjectContract } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { CreateProjectParams } from '../types/projectType';
import type { ApiError } from '../../../types/common';

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: Partial<CreateProjectParams>;
    }) => {
      const { team, contracts, ...rest } = data;
      const payload = {
        ...rest,
        start_date: rest.start_date || null,
        end_date: rest.end_date || null,
      };
      const project = await updateProject(projectId, payload);

      if (contracts && contracts.length > 0) {
        for (const contract of contracts) {
          if (contract.documentId) {
            await uploadProjectContract(projectId, {
              documentId: contract.documentId,
            });
          }
        }
      }

      if (team && team.length > 0) {
        const teamPayload = team.map((member) => ({
          user_id: member.user_id,
          role: member.role,
          is_lead: member.is_lead,
        }));
        await addTeamMembers(projectId, { members: teamPayload });
      }

      return project;
    },
    onSuccess: (_, { projectId }) => {
      showToast('Project updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to update project';
      showToast(message, 'error');
    },
  });
};
