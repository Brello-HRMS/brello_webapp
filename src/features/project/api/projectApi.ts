import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  GetProjectsResponse,
  GetProjectsParams,
  CreateProjectParams,
  Project,
  AddTeamMembersParams,
  GetProjectTeamResponse,
} from '../types/projectType';

export const getProjects = async (
  clientId: string,
  params?: GetProjectsParams,
): Promise<GetProjectsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/clients/${clientId}/projects`, { params });
};

export const getAllProjects = async (params?: GetProjectsParams): Promise<GetProjectsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/projects`, { params });
};

export const createProject = async (
  clientId: string,
  data: CreateProjectParams,
): Promise<Project> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/clients/${clientId}/projects`, data);
};

export const updateProject = async (
  projectId: string,
  data: Partial<CreateProjectParams>,
): Promise<Project> => {
  return apiClient.put(`${envVars.BRELLO_BASE_API}/projects/${projectId}`, data);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/projects/${projectId}`);
};

export const addTeamMembers = async (
  projectId: string,
  data: AddTeamMembersParams,
): Promise<void> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/projects/${projectId}/team`, data);
};

export const getProjectTeam = async (projectId: string): Promise<GetProjectTeamResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/projects/${projectId}/team`);
};
