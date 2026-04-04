import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getProjectContracts, deleteProjectContract } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { GetProjectContractsResponse } from '../types/projectType';

export const useProjectContracts = (projectId?: string) => {
  return useQuery<GetProjectContractsResponse, ApiError>({
    queryKey: ['project-contracts', projectId],
    queryFn: async () => {
      try {
        const response = await getProjectContracts(projectId!);
        return response;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch project contracts';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!projectId,
  });
};

export const useDeleteProjectContract = (projectId?: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: (contractId: string) => deleteProjectContract(projectId!, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
      showToast('Contract deleted successfully', 'success');
    },
    onError: (error) => {
      const message = (error as ApiError)?.data?.message || 'Failed to delete contract';
      showToast(message, 'error');
    },
  });
};
