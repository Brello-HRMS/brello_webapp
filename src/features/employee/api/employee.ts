/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  GetEmployeesParams,
  GetEmployeesResponse,
  CreateEmployeeDto,
  EmploymentDetailsDto,
  PayrollDetailsDto,
  SystemAccessDto,
  EducationDto,
  ExperienceDto,
} from '../types/employeeType';

export const getEmployees = async (params?: GetEmployeesParams): Promise<GetEmployeesResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/employees`, { params });
};

export const createEmployee = async (data: CreateEmployeeDto) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/employees`, data);
};

export const updateEmploymentDetails = async (id: string, data: EmploymentDetailsDto) => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/employees/${id}/employment`, data);
};

export const updatePayrollDetails = async (id: string, data: PayrollDetailsDto) => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/employees/${id}/payroll`, data);
};

export const updateSystemAccess = async (id: string, data: SystemAccessDto) => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/employees/${id}/system-access`, data);
};

export const addEducation = async (id: string, data: EducationDto) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/employees/${id}/education`, data);
};

export const addExperience = async (id: string, data: ExperienceDto) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/employees/${id}/experience`, data);
};

export const finalizeOnboarding = async (id: string) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/employees/${id}/onboard`, {});
};

export const linkDocuments = async (id: string, data: { documents: any[] }) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/employees/${id}/documents`, data);
};

export const getEmployeeDropdown = async () => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/employees/dropdown`);
};

export const getUploadUrl = async (data: {
  folderType: string;
  enterpriseId?: string;
  organizationId?: string;
  employeeId: string;
  originalName: string;
  mimeType: string;
  size: number;
}) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/documents/upload-url`, data);
};

export const uploadDocumentBinary = async (uploadUrl: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(uploadUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
