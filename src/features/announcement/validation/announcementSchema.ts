import { z } from 'zod';

import {
  AnnouncementAudienceType,
  AnnouncementPriority,
  AnnouncementPublishType,
} from '../types/announcementTypes';

export const announcementSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
    description_html: z.string().min(1, 'Description is required'),
    priority: z.nativeEnum(AnnouncementPriority),
    publish_type: z.nativeEnum(AnnouncementPublishType),
    scheduled_at: z.string().optional(),
    audience_type: z.nativeEnum(AnnouncementAudienceType),
    department_ids: z.array(z.string()),
    location_ids: z.array(z.string()),
    employee_ids: z.array(z.string()),
    send_push: z.boolean(),
    send_email: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.publish_type === AnnouncementPublishType.SCHEDULED) {
        return !!data.scheduled_at && new Date(data.scheduled_at) > new Date();
      }
      return true;
    },
    { message: 'Scheduled time must be a future date', path: ['scheduled_at'] },
  );

export type AnnouncementSchemaType = z.infer<typeof announcementSchema>;
