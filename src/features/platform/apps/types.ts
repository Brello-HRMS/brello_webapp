import { Status } from '../../../types/common';

export type PlatformApp = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  priority: number;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type AppsResponse = {
  success: boolean;
  data: PlatformApp[];
};

export type CreateAppRequest = {
  name: string;
  description: string;
  icon?: string;
  priority?: number;
};

export type UpdateAppRequest = Partial<CreateAppRequest>;
