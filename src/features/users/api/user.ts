import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { GetUsersResponse, MapUsersPayload, UnmapUserPayload } from '../types/userType';

export const getUsers = async (): Promise<GetUsersResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/users/list`);
};

export const mapUsers = async (payload: MapUsersPayload): Promise<void> => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/users/map`, payload);
};

export const unmapUsers = async (payload: UnmapUserPayload): Promise<void> => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/users/unmap`, payload);
};
