import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  PayrollCycleConfig,
  StatutoryPFConfig,
  SalaryComponent,
  SalaryTemplate,
  ApiResponse,
  EmployeeListResponse,
  EmployeeSalaryInfo,
  EmployeeSalaryStructure,
  AssignSalaryPayload,
  DryRunPayload,
  DryRunResult,
} from '../types/payrollConfigTypes';

const BASE_URL = `${envVars.BRELLO_BASE_API}/payroll`;

// --- Payroll Settings ---
export const getPayrollSettings = async (): Promise<PayrollCycleConfig> => {
  const response = await apiClient.get<unknown, ApiResponse<PayrollCycleConfig>>(
    `${BASE_URL}/configurations`,
  );
  return response.data;
};

export const updatePayrollSettings = async (
  data: PayrollCycleConfig,
): Promise<PayrollCycleConfig> => {
  const response = await apiClient.put<unknown, ApiResponse<PayrollCycleConfig>>(
    `${BASE_URL}/configurations`,
    data,
  );
  return response.data;
};

// --- Component Master ---
export const getSalaryComponents = async (): Promise<SalaryComponent[]> => {
  const response = await apiClient.get<unknown, ApiResponse<SalaryComponent[]>>(
    `${BASE_URL}/component-master`,
  );
  return response.data;
};

export const createSalaryComponent = async (
  data: Partial<SalaryComponent>,
): Promise<SalaryComponent> => {
  const response = await apiClient.post<unknown, ApiResponse<SalaryComponent>>(
    `${BASE_URL}/component-master`,
    data,
  );
  return response.data;
};

export const updateSalaryComponent = async (
  id: string,
  data: Partial<SalaryComponent>,
): Promise<SalaryComponent> => {
  const response = await apiClient.put<unknown, ApiResponse<SalaryComponent>>(
    `${BASE_URL}/component-master/${id}`,
    data,
  );
  return response.data;
};

export const deleteSalaryComponent = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/component-master/${id}`);
};

// --- PF Configuration ---
export const getPfConfig = async (): Promise<StatutoryPFConfig> => {
  const response = await apiClient.get<unknown, ApiResponse<StatutoryPFConfig>>(
    `${BASE_URL}/statutory-pf-config`,
  );
  return response.data;
};

export const updatePfConfig = async (data: StatutoryPFConfig): Promise<StatutoryPFConfig> => {
  const response = await apiClient.put<unknown, ApiResponse<StatutoryPFConfig>>(
    `${BASE_URL}/statutory-pf-config`,
    data,
  );
  return response.data;
};

// --- Salary Templates ---
export const getSalaryTemplates = async (): Promise<SalaryTemplate[]> => {
  const response = await apiClient.get<unknown, ApiResponse<SalaryTemplate[]>>(
    `${BASE_URL}/salary-templates`,
  );
  return response.data;
};

export const createSalaryTemplate = async (
  data: Partial<SalaryTemplate>,
): Promise<SalaryTemplate> => {
  const response = await apiClient.post<unknown, ApiResponse<SalaryTemplate>>(
    `${BASE_URL}/salary-templates`,
    data,
  );
  return response.data;
};

export const updateSalaryTemplate = async (
  id: string,
  data: Partial<SalaryTemplate>,
): Promise<SalaryTemplate> => {
  const response = await apiClient.put<unknown, ApiResponse<SalaryTemplate>>(
    `${BASE_URL}/salary-templates/${id}`,
    data,
  );
  return response.data;
};

export const getSalaryTemplate = async (id: string): Promise<SalaryTemplate> => {
  const response = await apiClient.get<unknown, ApiResponse<SalaryTemplate>>(
    `${BASE_URL}/salary-templates/${id}`,
  );
  return response.data;
};

export const deleteSalaryTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/salary-templates/${id}`);
};

// --- Employee Payroll ---
export const getEmployeesList = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
}): Promise<EmployeeListResponse> => {
  const response = await apiClient.get<unknown, ApiResponse<EmployeeListResponse>>(
    `${BASE_URL}/employees`,
    { params },
  );
  return response.data;
};

export const assignEmployeeSalary = async (data: AssignSalaryPayload): Promise<void> => {
  await apiClient.post(`${BASE_URL}/employee-salary-assignments`, data);
};

export const getEmployeeSalaryStructure = async (
  userId: string,
): Promise<EmployeeSalaryStructure> => {
  const response = await apiClient.get<unknown, ApiResponse<EmployeeSalaryStructure>>(
    `${BASE_URL}/employees/${userId}/salary`,
  );
  return response.data;
};

export const getEmployeeSalaryHistory = async (userId: string): Promise<EmployeeSalaryInfo[]> => {
  const response = await apiClient.get<unknown, ApiResponse<EmployeeSalaryInfo[]>>(
    `${BASE_URL}/employees/${userId}/salary/history`,
  );
  return response.data;
};

// --- Dry Run ---
export const runDryRun = async (data: DryRunPayload): Promise<DryRunResult> => {
  const response = await apiClient.post<unknown, ApiResponse<DryRunResult>>(
    `${BASE_URL}/simulations/dry-run`,
    data,
  );
  return response.data;
};
