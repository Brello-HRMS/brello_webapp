import * as z from 'zod';

export const projectStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED']);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectPrioritySchema = z.enum(['High', 'Medium', 'Low']);
export type ProjectPriority = z.infer<typeof projectPrioritySchema>;

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.string().min(1, 'Project type is required'),
  status: projectStatusSchema,
  priority: projectPrioritySchema,
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  lead_id: z.string().optional(),
  team: z
    .array(
      z.object({
        employee_id: z.string(),
        role: z.string().min(1, 'Role is required'),
      }),
    )
    .optional(),
  contracts: z
    .array(
      z.object({
        name: z.string(),
        file: z.any(),
      }),
    )
    .optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
