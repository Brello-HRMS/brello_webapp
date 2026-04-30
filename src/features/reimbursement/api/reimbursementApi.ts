import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  Reimbursement,
  PaginatedReimbursements,
  CreateReimbursementPayload,
  UpdateReimbursementPayload,
  AdminUpdateStatusPayload,
  EmployeeReimbursementQuery,
  AdminReimbursementQuery,
} from '../types/reimbursementTypes';

const BASE_URL = `${envVars.BRELLO_BASE_API}/reimbursements`;
const ADMIN_BASE_URL = `${envVars.BRELLO_BASE_API}/admin/reimbursements`;

type ApiResponse<T> = { data: T };

// --- Employee ---

export const createReimbursement = async (
  data: CreateReimbursementPayload,
): Promise<Reimbursement> => {
  const res = await apiClient.post<unknown, ApiResponse<Reimbursement>>(BASE_URL, data);
  return res.data;
};

export const getMyReimbursements = async (
  params: EmployeeReimbursementQuery,
): Promise<PaginatedReimbursements> => {
  const res = await apiClient.get<unknown, ApiResponse<PaginatedReimbursements>>(`${BASE_URL}/me`, {
    params,
  });
  return res.data;
};

export const updateReimbursement = async (
  id: string,
  data: UpdateReimbursementPayload,
): Promise<Reimbursement> => {
  const res = await apiClient.put<unknown, ApiResponse<Reimbursement>>(`${BASE_URL}/${id}`, data);
  return res.data;
};

export const deleteReimbursement = async (id: string): Promise<{ success: boolean }> => {
  const res = await apiClient.delete<unknown, ApiResponse<{ success: boolean }>>(
    `${BASE_URL}/${id}`,
  );
  return res.data;
};

// --- Admin ---

export const getAllReimbursements = async (
  params: AdminReimbursementQuery,
): Promise<PaginatedReimbursements> => {
  const res = await apiClient.get<unknown, ApiResponse<PaginatedReimbursements>>(ADMIN_BASE_URL, {
    params,
  });
  return res.data;
};

export const updateReimbursementStatus = async (
  id: string,
  data: AdminUpdateStatusPayload,
): Promise<Reimbursement> => {
  const res = await apiClient.patch<unknown, ApiResponse<Reimbursement>>(
    `${ADMIN_BASE_URL}/${id}/status`,
    data,
  );
  return res.data;
};

export const markReimbursementPaid = async (id: string): Promise<Reimbursement> => {
  const res = await apiClient.patch<unknown, ApiResponse<Reimbursement>>(
    `${ADMIN_BASE_URL}/${id}/mark-paid`,
  );
  return res.data;
};
