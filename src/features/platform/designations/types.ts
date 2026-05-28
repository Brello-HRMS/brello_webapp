import { Status } from '../../../types/common';

export type PlatformDesignation = {
  id: string;
  title: string;
  code: string;
  description: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type PlatformDesignationsResponse = {
  success: boolean;
  data: PlatformDesignation[];
  timestamp: string;
};

export type CreatePlatformDesignationRequest = {
  title: string;
  code: string;
  description?: string;
  status?: Status;
};

export type UpdatePlatformDesignationRequest = {
  title?: string;
  description?: string;
  status?: Status;
};
