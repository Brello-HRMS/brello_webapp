import { z } from 'zod';

import { FeedbackType, FeedbackCategory } from '../enums/feedback.enum';

const FEEDBACK_CATEGORIES = [
  FeedbackCategory.FEATURE_REQUEST,
  FeedbackCategory.SUGGESTION,
  FeedbackCategory.PRAISE,
] as const;

const ISSUE_CATEGORIES = [
  FeedbackCategory.BUG,
  FeedbackCategory.UI_UX,
  FeedbackCategory.PERFORMANCE,
  FeedbackCategory.DATA_ISSUE,
] as const;

export const submitFeedbackSchema = z
  .object({
    type: z.enum([FeedbackType.FEEDBACK, FeedbackType.ISSUE_REPORT], {
      required_error: 'Type is required',
    }),
    category: z.nativeEnum(FeedbackCategory, { required_error: 'Category is required' }),
    title: z.string().min(1, 'Title is required').max(255, 'Title must be under 255 characters'),
    ticket_description: z.string().min(1, 'Description is required'),
    affected_module: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === FeedbackType.FEEDBACK) {
        return (FEEDBACK_CATEGORIES as readonly string[]).includes(data.category);
      }
      return (ISSUE_CATEGORIES as readonly string[]).includes(data.category);
    },
    {
      message: 'Selected category does not match the ticket type',
      path: ['category'],
    },
  );

export type SubmitFeedbackFormData = z.infer<typeof submitFeedbackSchema>;

export const addCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
});

export type AddCommentFormData = z.infer<typeof addCommentSchema>;
