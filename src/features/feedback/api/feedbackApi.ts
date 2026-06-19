import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  FeedbackTicket,
  FeedbackTicketDetail,
  FeedbackComment,
  PaginatedFeedbackTickets,
  CreateFeedbackTicketPayload,
  AddCommentPayload,
  PlatformAddCommentPayload,
  UpdateTicketPayload,
  OrgFeedbackQuery,
  PlatformFeedbackQuery,
  PlatformFeedbackStats,
} from '../types/feedbackTypes';

const BASE = `${envVars.BRELLO_BASE_API}/feedback-tickets`;
const PLATFORM_BASE = `${envVars.BRELLO_BASE_API}/platform/feedback-tickets`;

type ApiResponse<T> = { data: T };

// --- Org-facing ---

export const createFeedbackTicket = async (
  data: CreateFeedbackTicketPayload,
): Promise<FeedbackTicket> => {
  const res = await apiClient.post<unknown, ApiResponse<FeedbackTicket>>(BASE, data);
  return res.data;
};

export const getMyTickets = async (params: OrgFeedbackQuery): Promise<PaginatedFeedbackTickets> => {
  const res = await apiClient.get<unknown, ApiResponse<PaginatedFeedbackTickets>>(BASE, { params });
  return res.data;
};

export const getTicketDetail = async (id: string): Promise<FeedbackTicketDetail> => {
  const res = await apiClient.get<unknown, ApiResponse<FeedbackTicketDetail>>(`${BASE}/${id}`);
  return res.data;
};

export const addOrgComment = async (
  ticketId: string,
  data: AddCommentPayload,
): Promise<FeedbackComment> => {
  const res = await apiClient.post<unknown, ApiResponse<FeedbackComment>>(
    `${BASE}/${ticketId}/comments`,
    data,
  );
  return res.data;
};

// --- Platform Admin ---

export const getPlatformTickets = async (
  params: PlatformFeedbackQuery,
): Promise<PaginatedFeedbackTickets> => {
  const res = await apiClient.get<unknown, ApiResponse<PaginatedFeedbackTickets>>(PLATFORM_BASE, {
    params,
  });
  return res.data;
};

export const getPlatformTicketDetail = async (id: string): Promise<FeedbackTicketDetail> => {
  const res = await apiClient.get<unknown, ApiResponse<FeedbackTicketDetail>>(
    `${PLATFORM_BASE}/${id}`,
  );
  return res.data;
};

export const updatePlatformTicket = async (
  id: string,
  data: UpdateTicketPayload,
): Promise<FeedbackTicket> => {
  const res = await apiClient.patch<unknown, ApiResponse<FeedbackTicket>>(
    `${PLATFORM_BASE}/${id}`,
    data,
  );
  return res.data;
};

export const addPlatformComment = async (
  ticketId: string,
  data: PlatformAddCommentPayload,
): Promise<FeedbackComment> => {
  const res = await apiClient.post<unknown, ApiResponse<FeedbackComment>>(
    `${PLATFORM_BASE}/${ticketId}/comments`,
    data,
  );
  return res.data;
};

export const getPlatformStats = async (): Promise<PlatformFeedbackStats> => {
  const res = await apiClient.get<unknown, ApiResponse<PlatformFeedbackStats>>(
    `${PLATFORM_BASE}/stats`,
  );
  return res.data;
};
