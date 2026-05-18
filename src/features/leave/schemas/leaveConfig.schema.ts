import { z } from 'zod';

export const leaveTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Leave type name is required'),
  days: z.number().min(0, 'Days must be at least 0'),
  accrual: z.enum(['none', 'monthly', 'yearly']),
  allowHalfDay: z.boolean(),
});

export const leaveRulesSchema = z
  .object({
    approvalRequired: z.boolean(),
    maxPerMonth: z.number().min(0).optional(),
    allowHalfDay: z.boolean(),
    allowBackdated: z.boolean(),
    maxBackdatedDays: z.number().min(0).optional(),
    sandwichRule: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.allowBackdated && !data.maxBackdatedDays) {
        return false;
      }
      return true;
    },
    {
      message: 'Max backdated days must be specified if backdated leave is allowed',
      path: ['maxBackdatedDays'],
    },
  );

export const leaveConfigSchema = z
  .object({
    totalLeave: z.number().min(1, 'Total leave must be greater than 0'),
    rules: leaveRulesSchema,
    leaveTypes: z.array(leaveTypeSchema),
  })
  .refine(
    (data) => {
      const totalAllocated = data.leaveTypes.reduce((sum, type) => sum + type.days, 0);
      return totalAllocated === data.totalLeave;
    },
    {
      message: 'Allocated leave must equal total leave',
      path: ['leaveTypes'],
    },
  );

export type LeaveConfigFormValues = z.infer<typeof leaveConfigSchema>;
export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>;
export type LeaveRulesFormValues = z.infer<typeof leaveRulesSchema>;
