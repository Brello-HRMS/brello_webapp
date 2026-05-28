import { Status } from '../../../types/common';

export type PlanModule = {
  id: string;
  plan_id: string;
  module_id: string;
  enabled: boolean;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type PlanModuleAction = {
  id: string;
  plan_id: string;
  module_id: string;
  action_id: string;
  enabled: boolean;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type PlanModulesResponse = { success: boolean; data: PlanModule[] };
export type PlanModuleActionsResponse = { success: boolean; data: PlanModuleAction[] };

export type CreatePlanModuleRequest = { plan_id: string; module_id: string; enabled?: boolean };
export type UpdatePlanModuleRequest = { enabled: boolean };

export type CreatePlanModuleActionRequest = {
  plan_id: string;
  module_id: string;
  action_id: string;
  enabled?: boolean;
};
export type UpdatePlanModuleActionRequest = { enabled: boolean };
