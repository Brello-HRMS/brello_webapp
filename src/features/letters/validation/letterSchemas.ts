import { z } from 'zod';

export const letterCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
});

export type LetterCategoryFormInput = z.input<typeof letterCategorySchema>;
export type LetterCategoryFormOutput = z.output<typeof letterCategorySchema>;

export const letterTemplateSchema = z.object({
  name: z
    .string()
    .min(2, 'Template name must be at least 2 characters')
    .max(255, 'Template name must not exceed 255 characters'),
  subject: z
    .string()
    .max(500, 'Subject must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  content: z.string().default(''),
});

export type LetterTemplateFormInput = z.input<typeof letterTemplateSchema>;
export type LetterTemplateFormOutput = z.output<typeof letterTemplateSchema>;
