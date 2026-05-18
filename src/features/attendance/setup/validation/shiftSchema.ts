import { z } from 'zod';

export const shiftSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    is_night_shift: z.boolean().default(false),
    late_grace_minutes: z.coerce.number().min(0, 'Must be 0 or more'),
    auto_checkout_time: z.string().min(1, 'Auto checkout time is required'),
    full_day_hours: z.coerce.number().min(1, 'Must be at least 1 hour'),
    half_day_hours: z.coerce.number().min(1, 'Must be at least 1 hour'),
  })
  .refine(
    (data) => {
      if (!data.auto_checkout_time || !data.end_time) return true;
      const [h1, m1] = data.end_time.split(':').map(Number);
      const [h2, m2] = data.auto_checkout_time.split(':').map(Number);
      let endMinutes = h1 * 60 + m1;
      let autoMinutes = h2 * 60 + m2;

      if (data.is_night_shift && data.start_time) {
        const [hs, ms] = data.start_time.split(':').map(Number);
        const startMinutes = hs * 60 + ms;
        if (endMinutes < startMinutes) endMinutes += 1440;
        if (autoMinutes < startMinutes) autoMinutes += 1440;
      }

      return autoMinutes >= endMinutes;
    },
    {
      message: 'Auto checkout time must be after or equal to end time',
      path: ['auto_checkout_time'],
    },
  );

export type ShiftFormInput = z.input<typeof shiftSchema>;
export type ShiftFormOutput = z.output<typeof shiftSchema>;
