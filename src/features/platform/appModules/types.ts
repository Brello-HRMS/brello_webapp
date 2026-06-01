import { Status } from '../../../types/common';

export enum ModuleType {
  MOD = 'mod',
  SUBMOD = 'submod',
}

export type AppModule = {
  id: string;
  name: string;
  code: string;
  app_id: string;
  wbs_code: string;
  parent_id: string | null;
  type: ModuleType;
  icon: string | null;
  path: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type AppModulesResponse = {
  success: boolean;
  data: AppModule[];
};

export type CreateModuleRequest = {
  name: string;
  code: string;
  app_id: string;
  wbs_code: string;
  parent_id?: string;
  type?: ModuleType;
  icon?: string;
  path?: string;
};

export type UpdateModuleRequest = {
  name?: string;
  code?: string;
  wbs_code?: string;
  type?: ModuleType;
  icon?: string;
  path?: string;
};

export type ModuleTreeNode = AppModule & {
  children: AppModule[];
};
