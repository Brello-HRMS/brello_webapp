import * as z from 'zod';

import { ProjectStatus, ProjectPriority, ProjectType } from '../types/projectType';

export const projectStatusSchema = z.nativeEnum(ProjectStatus);

export const projectPrioritySchema = z.nativeEnum(ProjectPriority);

export const projectTypeSchema = z.nativeEnum(ProjectType);

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  project_type: projectTypeSchema,
  project_status: projectStatusSchema,
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
