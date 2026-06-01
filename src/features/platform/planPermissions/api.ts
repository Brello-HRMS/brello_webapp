import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  PlanModulesResponse,
  PlanModuleActionsResponse,
  CreatePlanModuleRequest,
  UpdatePlanModuleRequest,
  CreatePlanModuleActionRequest,
  UpdatePlanModuleActionRequest,
} from './types';
import type { AppModulesResponse } from '../appModules/types';

const PLAN_MODULES = `${envVars.BRELLO_BASE_API}/plan-modules`;
const PLAN_MODULE_ACTIONS = `${envVars.BRELLO_BASE_API}/plan-module-actions`;
const APP_MODULES = `${envVars.BRELLO_BASE_API}/app-modules`;

export const getPlanModules = (planId: string): Promise<PlanModulesResponse> =>
  apiClient.get(`${PLAN_MODULES}/plan/${planId}`);

export const createPlanModule = (
  data: CreatePlanModuleRequest,
): Promise<{ success: boolean; data: { id: string } }> => apiClient.post(PLAN_MODULES, data);

export const updatePlanModule = (
  id: string,
  data: UpdatePlanModuleRequest,
): Promise<{ success: boolean; data: { id: string } }> =>
  apiClient.patch(`${PLAN_MODULES}/${id}`, data);

export const getPlanModuleActions = (planId: string): Promise<PlanModuleActionsResponse> =>
  apiClient.get(`${PLAN_MODULE_ACTIONS}/plan/${planId}`);

export const createPlanModuleAction = (
  data: CreatePlanModuleActionRequest,
): Promise<{ success: boolean; data: { id: string } }> => apiClient.post(PLAN_MODULE_ACTIONS, data);

export const updatePlanModuleAction = (
  id: string,
  data: UpdatePlanModuleActionRequest,
): Promise<{ success: boolean; data: { id: string } }> =>
  apiClient.patch(`${PLAN_MODULE_ACTIONS}/${id}`, data);

export const getAllModules = (): Promise<AppModulesResponse> => apiClient.get(APP_MODULES);
