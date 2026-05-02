export const Status = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const SortOrder = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export interface BrelloApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  errorCode: string;
}

export interface ApiError {
  message: string;
  status: number;
  data: BrelloApiError | null;
  response: {
    data: BrelloApiError | null;
  };
}
export interface PaginatedResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedResponseMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
