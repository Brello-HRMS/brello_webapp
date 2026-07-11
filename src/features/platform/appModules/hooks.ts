import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import { getModulesByApp, createModule, updateModule, deleteModule, reorderModules } from './api';

import type { ApiError } from '../../../types/common';
import type {
  AppModulesResponse,
  CreateModuleRequest,
  UpdateModuleRequest,
  ReorderModulesRequest,
} from './types';

const queryKey = (appId: string) => ['platform', 'app-modules', appId];

export const useModulesByApp = (appId: string | null) =>
  useQuery({
    queryKey: queryKey(appId ?? ''),
    queryFn: () => getModulesByApp(appId!),
    enabled: !!appId,
  });

export const useCreateModule = (appId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModuleRequest) => createModule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(appId) });
      showToast('Module created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create module', 'error');
    },
  });
};

export const useUpdateModule = (appId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModuleRequest }) => updateModule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(appId) });
      showToast('Module updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update module', 'error');
    },
  });
};

export const useReorderModules = (appId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReorderModulesRequest) => reorderModules(data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: queryKey(appId) });
      const previous = qc.getQueryData<AppModulesResponse>(queryKey(appId));

      if (previous) {
        const patchById = new Map(data.updates.map((u) => [u.id, u]));
        qc.setQueryData<AppModulesResponse>(queryKey(appId), {
          ...previous,
          data: previous.data.map((m) => {
            const patch = patchById.get(m.id);
            return patch
              ? { ...m, parent_id: patch.parent_id, wbs_code: patch.wbs_code, type: patch.type }
              : m;
          }),
        });
      }

      return { previous };
    },
    onError: (error: ApiError, _data, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKey(appId), context.previous);
      }
      showToast(error?.data?.message || 'Failed to move module', 'error');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKey(appId) });
    },
  });
};

export const useDeleteModule = (appId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(appId) });
      showToast('Module deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete module', 'error');
    },
  });
};
