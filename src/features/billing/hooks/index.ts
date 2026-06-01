import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';
import { getSubscription, getOrgPlans, upgradePlan } from '../api';

import type { ApiError } from '../../../types/common';
import type { UpgradePlanRequest } from '../types';

const SUBSCRIPTION_KEY = ['billing', 'subscription'];
const PLANS_KEY = ['billing', 'plans'];

export const useSubscription = () =>
  useQuery({
    queryKey: SUBSCRIPTION_KEY,
    queryFn: getSubscription,
  });

export const useOrgPlans = () =>
  useQuery({
    queryKey: PLANS_KEY,
    queryFn: getOrgPlans,
  });

export const useUpgradePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpgradePlanRequest) => upgradePlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      showToast('Plan upgraded successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to upgrade plan', 'error');
    },
  });
};
