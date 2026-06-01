import { useQuery } from '@tanstack/react-query';

import { getPlanModules, getPlanModuleActions, getAllModules } from './api';

export const PLAN_MODULES_KEY = (planId: string) => ['platform', 'plan-modules', planId];
export const PLAN_MODULE_ACTIONS_KEY = (planId: string) => [
  'platform',
  'plan-module-actions',
  planId,
];
export const ALL_MODULES_KEY = ['platform', 'all-modules'];

export const usePlanModules = (planId: string) =>
  useQuery({
    queryKey: PLAN_MODULES_KEY(planId),
    queryFn: () => getPlanModules(planId),
    enabled: !!planId,
  });

export const usePlanModuleActions = (planId: string) =>
  useQuery({
    queryKey: PLAN_MODULE_ACTIONS_KEY(planId),
    queryFn: () => getPlanModuleActions(planId),
    enabled: !!planId,
  });

export const useAllModules = () => useQuery({ queryKey: ALL_MODULES_KEY, queryFn: getAllModules });
