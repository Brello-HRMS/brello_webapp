import { z } from 'zod';

export enum ExitType {
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  RETIRED = 'RETIRED',
  DECEASED = 'DECEASED',
}

export const initiateOffboardingSchema = z.object({
  exit_type: z.nativeEnum(ExitType, {
    errorMap: () => ({ message: 'Please select a valid exit type' }),
  }),
  reason: z.string().min(1, 'Reason is required'),
  last_working_day: z.string().min(1, 'Last working day is required'),
  notice_period: z.number().optional(),
  handover_to_user_id: z.string().uuid().optional(),
  assets_to_recover: z.array(z.string()).optional(),
  schedule_exit_interview: z.boolean().optional(),
});

export type InitiateOffboardingDto = z.infer<typeof initiateOffboardingSchema>;

export interface UpdateOffboardingDto {
  reason?: string;
  last_working_day?: string;
  notice_period?: number;
}

export interface OffboardingStatus {
  id: string;
  enterprise_id: string | null;
  organization_id: string | null;
  status: string;
  user_id: string;
  exit_type: ExitType;
  reason: string;
  last_working_day: string;
  notice_period: number | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetOffboardingStatusResponse {
  success: boolean;
  data: OffboardingStatus;
  timestamp: string;
}

export interface GeneralOffboardingResponse {
  success: boolean;
  data: {
    success: boolean;
  };
  timestamp: string;
}
