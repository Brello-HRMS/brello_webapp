import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addTeamMembers, updateProject } from '../api/projectApi';
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
      const { team, contracts: _contracts, ...rest } = data;
      const payload = {
        ...rest,
        start_date: rest.start_date || null,
        end_date: rest.end_date || null,
      };
      const project = await updateProject(projectId, payload);
      // if (contracts && contracts.length > 0) {
      //   const contractPayload = contracts.map((contract) => ({
      //     name: contract.name,
      //     file: contract.file,
      //   }));
      //   await updateProjectContracts(projectId, contractPayload);
      // }

      if (team && team.length > 0) {
        const teamPayload = team.map((member) => ({
          user_id: member.employee_id,
          role: member.role,
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
