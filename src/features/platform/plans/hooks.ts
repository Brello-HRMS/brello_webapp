import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import { getPlans, createPlan, updatePlan, deletePlan, getPlanApps, syncPlanApps } from './api';

import type { ApiError } from '../../../types/common';
import type { CreatePlanRequest, UpdatePlanRequest } from './types';

const QUERY_KEY = ['platform', 'plans'];

export const usePlansList = (enterpriseId?: string) =>
  useQuery({
    queryKey: enterpriseId ? [...QUERY_KEY, enterpriseId] : QUERY_KEY,
    queryFn: () => getPlans(enterpriseId),
  });

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => createPlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Plan created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create plan', 'error');
    },
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) => updatePlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Plan updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update plan', 'error');
    },
  });
};

export const useDeletePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Plan deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete plan', 'error');
    },
  });
};

export const usePlanApps = (planId: string) =>
  useQuery({
    queryKey: [...QUERY_KEY, planId, 'apps'],
    queryFn: async () => {
      const result = await getPlanApps(planId);
      // Normalize: handle both raw array and { data: [...] } wrapped response
      return (
        Array.isArray(result) ? result : ((result as { data: { app_id: string }[] }).data ?? [])
      ) as { app_id: string }[];
    },
    enabled: !!planId,
  });

export const useSyncPlanApps = (planId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appIds: string[]) => syncPlanApps(planId, appIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEY, planId, 'apps'] });
      showToast('Apps updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update apps', 'error');
    },
  });
};
