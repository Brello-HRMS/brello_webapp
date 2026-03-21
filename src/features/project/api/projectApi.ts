import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  GetProjectsResponse,
  GetProjectsParams,
  CreateProjectParams,
  Project,
} from '../types/projectType';

export const getProjects = async (
  clientId: string,
  params?: GetProjectsParams,
): Promise<GetProjectsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/clients/${clientId}/projects`, { params });
};

export const createProject = async (
  clientId: string,
  data: CreateProjectParams,
): Promise<Project> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/clients/${clientId}/projects`, data);
};
