import { Status } from '../../../types/common';

export type Action = {
  id: string;
  name: string;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type ActionsResponse = {
  success: boolean;
  data: Action[];
};

export type CreateActionRequest = { name: string };
export type UpdateActionRequest = Partial<CreateActionRequest>;
