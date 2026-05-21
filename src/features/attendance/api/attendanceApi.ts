// import apiClient from '../../../utils/apiClient';
// import { envVars } from '../../../config/env';

import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  DailyPreviewResponse,
  DailyPreviewParams,
  AttendanceCheckInPayload,
  AttendanceCheckOutPayload,
  AttendanceManualEntryPayload,
} from '../types';

export const getDailyPreview = async (
  params?: DailyPreviewParams,
): Promise<DailyPreviewResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const url = `${envVars.BRELLO_BASE_API}/attendance/admin/daily-preview${
    queryString ? `?${queryString}` : ''
  }`;

  return apiClient.get(url);
};

export const checkIn = async (payload: AttendanceCheckInPayload) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/attendance/check-in`, payload);
};

export const checkOut = async (payload: AttendanceCheckOutPayload) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/attendance/check-out`, payload);
};

export const manualEntry = async (payload: AttendanceManualEntryPayload) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/attendance/admin/manual-entry`, payload);
};
