import type { Status } from '../../../types/common';

export type EnterpriseApp = {
  id: string;
  name: string;
  icon: string | null;
};

export type Enterprise = {
  id: string;
  name: string;
  domain: string;
  logo: string | null;
  favicon: string | null;
  code: string | null;
  description: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
  apps: EnterpriseApp[];
};

export type EnterprisesResponse = { success: boolean; data: Enterprise[] };
export type EnterpriseResponse = { success: boolean; data: Enterprise };

export type CreateEnterpriseRequest = {
  name: string;
  domain: string;
  logo?: string;
  favicon?: string;
};

export type UpdateEnterpriseRequest = Partial<CreateEnterpriseRequest>;
