import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  InitiateOffboardingDto,
  UpdateOffboardingDto,
  GetOffboardingStatusResponse,
  GeneralOffboardingResponse,
} from '../types/offboardingType';

export const initiateOffboarding = async (
  employeeId: string,
  data: InitiateOffboardingDto,
): Promise<GeneralOffboardingResponse> => {
  return apiClient.post(
    `${envVars.BRELLO_BASE_API}/employees/${employeeId}/offboarding/initiate`,
    data,
  );
};

export const updateOffboarding = async (
  employeeId: string,
  data: UpdateOffboardingDto,
): Promise<GeneralOffboardingResponse> => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/employees/${employeeId}/offboarding`, data);
};

export const getOffboardingStatus = async (
  employeeId: string,
): Promise<GetOffboardingStatusResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/employees/${employeeId}/offboarding`);
};

export const cancelOffboarding = async (
  employeeId: string,
): Promise<GeneralOffboardingResponse> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/employees/${employeeId}/offboarding`);
};
