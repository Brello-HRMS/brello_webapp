import { apiClient } from '../../../lib/axios';

export interface SetupStatusResponse {
  totalSteps: number;
  completedSteps: number;
  completionPercentage: number;
  steps: {
    DEPARTMENTS: boolean;
    DESIGNATIONS: boolean;
    COMPANY_POLICIES: boolean;
    PAYROLL: boolean;
    LEAVE: boolean;
    ATTENDANCE: boolean;
    EMPLOYEES: boolean;
  };
}

export const fetchOrgSetupStatus = async (): Promise<SetupStatusResponse | null> => {
  const { data } = await apiClient.get<SetupStatusResponse>('/organization/setup-status');
  return data;
};
