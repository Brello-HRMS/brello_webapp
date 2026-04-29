import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  PayrollCycleConfig,
  StatutoryPFConfig,
  SalaryComponent,
  SalaryTemplate,
  ApiResponse,
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

export const getSalaryTemplate = async (id: string): Promise<SalaryTemplate> => {
  const response = await apiClient.get<unknown, ApiResponse<SalaryTemplate>>(
    `${BASE_URL}/salary-templates/${id}`,
  );
  return response.data;
};
