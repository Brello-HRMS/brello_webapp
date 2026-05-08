import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  Announcement,
  PaginatedAnnouncements,
  PaginatedEmployeeAnnouncements,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  AdminAnnouncementQuery,
  EmployeeAnnouncementQuery,
} from '../types/announcementTypes';

const BASE_URL = `${envVars.BRELLO_BASE_API}/announcements`;
const EMPLOYEE_BASE_URL = `${envVars.BRELLO_BASE_API}/employee/announcements`;

type ApiResponse<T> = { data: T };

// --- Admin ---

export const createAnnouncement = async (
  data: CreateAnnouncementPayload,
): Promise<Announcement> => {
  const res = await apiClient.post<unknown, ApiResponse<Announcement>>(BASE_URL, data);
  return res.data;
};

export const getAnnouncements = async (
  params: AdminAnnouncementQuery,
): Promise<PaginatedAnnouncements> => {
  const res = await apiClient.get<unknown, ApiResponse<PaginatedAnnouncements>>(BASE_URL, {
    params,
  });
  return res.data;
};

export const getAnnouncement = async (id: string): Promise<Announcement> => {
  const res = await apiClient.get<unknown, ApiResponse<Announcement>>(`${BASE_URL}/${id}`);
  return res.data;
};

export const updateAnnouncement = async (
  id: string,
  data: UpdateAnnouncementPayload,
): Promise<Announcement> => {
  const res = await apiClient.put<unknown, ApiResponse<Announcement>>(`${BASE_URL}/${id}`, data);
  return res.data;
};

export const deleteAnnouncement = async (id: string): Promise<{ success: boolean }> => {
  const res = await apiClient.delete<unknown, ApiResponse<{ success: boolean }>>(
    `${BASE_URL}/${id}`,
  );
  return res.data;
};

export const publishAnnouncement = async (id: string): Promise<Announcement> => {
  const res = await apiClient.post<unknown, ApiResponse<Announcement>>(`${BASE_URL}/${id}/publish`);
  return res.data;
};

export const archiveAnnouncement = async (id: string): Promise<Announcement> => {
  const res = await apiClient.post<unknown, ApiResponse<Announcement>>(`${BASE_URL}/${id}/archive`);
  return res.data;
};

// --- Employee ---

export const getEmployeeAnnouncements = async (
  params: EmployeeAnnouncementQuery,
): Promise<PaginatedEmployeeAnnouncements> => {
  const res = await apiClient.get<unknown, ApiResponse<PaginatedEmployeeAnnouncements>>(
    EMPLOYEE_BASE_URL,
    { params },
  );
  return res.data;
};

export const markAnnouncementRead = async (id: string): Promise<{ success: boolean }> => {
  const res = await apiClient.post<unknown, ApiResponse<{ success: boolean }>>(
    `${EMPLOYEE_BASE_URL}/${id}/read`,
  );
  return res.data;
};
