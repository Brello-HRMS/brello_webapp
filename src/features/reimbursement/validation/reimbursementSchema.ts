import { z } from 'zod';

export const addReimbursementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  expense_description: z.string().optional(),
  expense_date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => new Date(val) <= new Date(), {
      message: 'Expense date cannot be in the future',
    }),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => Number(val) > 0, { message: 'Amount must be greater than 0' }),
});

export type AddReimbursementFormData = z.infer<typeof addReimbursementSchema>;

export const editStatusSchema = z
  .object({
    status: z.enum(['Pending', 'Approved', 'Rejected']),
    rejection_reason: z.string().optional(),
    is_paid: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.status === 'Rejected') return !!data.rejection_reason?.trim();
      return true;
    },
    { message: 'Rejection reason is required', path: ['rejection_reason'] },
  );

export type EditStatusFormData = z.infer<typeof editStatusSchema>;
