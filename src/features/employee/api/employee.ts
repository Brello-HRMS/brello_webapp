import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { GetEmployeesParams, GetEmployeesResponse } from '../types/employeeType';

export const getEmployees = async (params?: GetEmployeesParams): Promise<GetEmployeesResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/employees`, { params });
};
