import { z } from 'zod';

import type { SalaryComponent } from '../types/payrollConfigTypes';

export const getSalaryTemplateSchema = (availableComponents: SalaryComponent[]) =>
  z
    .object({
      name: z.string().trim().min(1, 'Template name is required.'),
      description: z.string(),
      componentIds: z.array(z.string()).min(1, 'At least one component must be selected.'),
      status: z.boolean(),
    })
    .superRefine((data, ctx) => {
      const selectedComponents = availableComponents.filter((component) =>
        data.componentIds.includes(component.id),
      );

      if (data.componentIds.length > 0) {
        // 1. Basic Salary Check
        const hasBasicSalary = selectedComponents.some(
          (component) => component.name === 'Basic Salary' || component.name === 'Basic',
        );
        if (!hasBasicSalary) {
          ctx.addIssue({
            code: 'custom',
            message: 'Template must include "Basic Salary".',
            path: ['componentIds'],
          });
        }

        // 2. UUID-based dependency check: if a selected component's calculate_from points to
        //    another component (not CTC), that base component must also be selected.
        for (const component of selectedComponents) {
          const baseId = component.calculate_from;
          if (baseId) {
            const isBaseCTC = !availableComponents.find((c) => c.id === baseId);
            if (!isBaseCTC && !data.componentIds.includes(baseId)) {
              const baseName = availableComponents.find((c) => c.id === baseId)?.name ?? baseId;
              ctx.addIssue({
                code: 'custom',
                message: `"${component.name}" depends on "${baseName}", which is not in this template.`,
                path: ['componentIds'],
              });
              break;
            }
          }
        }
      }
    });

export const addComponentSchema = z
  .object({
    name: z.string().trim().min(1, 'Component name is required.'),
    componentType: z.enum(['earning', 'deduction', 'bonus']),
    category: z.enum(['fixed', 'variable', 'statutory']),
    calculationType: z.enum(['fixed', 'percentage', 'residual']),
    value: z.union([z.string().min(1, 'Amount/Percentage is required.'), z.number()]),
    calculateFrom: z.string().optional(),
    taxable: z.boolean(),
    status: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.calculationType === 'percentage' && !data.calculateFrom) {
        return false;
      }
      return true;
    },
    {
      message: 'Base component is required for percentage calculation.',
      path: ['calculateFrom'],
    },
  );

export const assignSalarySchema = z.object({
  templateId: z.string().min(1, 'Template is required.'),
  ctc: z.union([
    z.string().min(1, 'CTC is required.'),
    z.number().positive('CTC must be positive'),
  ]),
  effectiveFrom: z.string().min(1, 'Effective from date is required.'),
});

export const dryRunSchema = z.object({
  templateId: z.string().min(1, 'Template is required.'),
  ctc: z.union([
    z.string().min(1, 'CTC is required.'),
    z.number().positive('CTC must be positive'),
  ]),
  bonus: z.union([z.string(), z.number()]).optional(),
  loanEmi: z.union([z.string(), z.number()]).optional(),
  lwpDays: z.union([z.string(), z.number()]).optional(),
  otherDeductions: z.union([z.string(), z.number()]).optional(),
});
