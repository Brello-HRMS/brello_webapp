import { z } from 'zod';

export const letterCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
});
export type LetterCategoryFormInput = z.input<typeof letterCategorySchema>;
export type LetterCategoryFormOutput = z.output<typeof letterCategorySchema>;

export const signatorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name is too long'),
  designation: z
    .string()
    .min(2, 'Designation must be at least 2 characters')
    .max(120, 'Designation is too long'),
  is_default: z.boolean().optional(),
});
export type SignatoryFormInput = z.input<typeof signatorySchema>;
export type SignatoryFormOutput = z.output<typeof signatorySchema>;

export const letterSettingsSchema = z.object({
  letter_prefix: z.string().min(1, 'Prefix is required').max(20, 'Prefix is too long'),
  default_signatory_id: z.string().optional().or(z.literal('')),
  date_format: z.string().min(1, 'Date format is required').max(30),
});
export type LetterSettingsFormInput = z.input<typeof letterSettingsSchema>;
export type LetterSettingsFormOutput = z.output<typeof letterSettingsSchema>;

export const letterTemplateSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name is too long'),
  description: z.string().max(500).optional().or(z.literal('')),
  heading: z.string().max(500).optional().or(z.literal('')),
  paragraphs: z.array(z.string()).default([]),
  bullet_list: z.array(z.string()).default([]),
  include_salary_table: z.boolean().optional(),
  signatory_id: z.string().optional().or(z.literal('')),
});
export type LetterTemplateFormInput = z.input<typeof letterTemplateSchema>;
export type LetterTemplateFormOutput = z.output<typeof letterTemplateSchema>;
