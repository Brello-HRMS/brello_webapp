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
            code: z.ZodIssueCode.custom,
            message: 'Template must include "Basic Salary".',
            path: ['componentIds'],
          });
        }

        // 2. Dependency Check
        for (const component of selectedComponents) {
          const calculationBase = component.calculation_value?.base;
          if (calculationBase && calculationBase !== 'CTC') {
            const hasDependencyBase = selectedComponents.some(
              (comp) => comp.name === calculationBase,
            );
            if (!hasDependencyBase) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Component "${component.name}" depends on "${calculationBase}", which is not included in this template.`,
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
    type: z.enum(['earning', 'deduction']),
    calculationType: z.enum(['fixed', 'percentage', 'residual']),
    amount: z.union([z.string().min(1, 'Amount/Percentage is required.'), z.number()]),
    parentComponentId: z.string().optional(),
    taxable: z.boolean(),
    status: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.calculationType === 'percentage' && !data.parentComponentId) {
        return false;
      }
      return true;
    },
    {
      message: 'Selection is required for percentage calculation.',
      path: ['parentComponentId'],
    },
  );
