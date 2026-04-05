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
}
