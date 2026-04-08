import type { SalaryComponent, SalaryTemplate } from '../types/payrollConfigTypes';

export const MOCK_SALARY_COMPONENTS: SalaryComponent[] = [
  {
    id: '1',
    name: 'Basic Salary',
    priority: 'Earning',
    calculationType: 'Fixed',
    taxable: true,
    status: 'Active',
  },
  {
    id: '2',
    name: 'HRA',
    priority: 'Earning',
    calculationType: 'Percentage',
    taxable: false,
    status: 'Active',
  },
  {
    id: '3',
    name: 'Special Allowance',
    priority: 'Earning',
    calculationType: 'Residual',
    taxable: false,
    status: 'Active',
  },
  {
    id: '4',
    name: 'Transport Allowance',
    priority: 'Earning',
    calculationType: 'Fixed',
    taxable: false,
    status: 'Active',
  },
  {
    id: '5',
    name: 'Medical Allowance',
    priority: 'Earning',
    calculationType: 'Fixed',
    taxable: false,
    status: 'Inactive',
  },
  {
    id: '6',
    name: 'Provident Fund',
    priority: 'Deduction',
    calculationType: 'Percentage',
    taxable: false,
    status: 'Active',
  },
  {
    id: '7',
    name: 'Professional Tax',
    priority: 'Deduction',
    calculationType: 'Fixed',
    taxable: false,
    status: 'Active',
  },
  {
    id: '8',
    name: 'TDS',
    priority: 'Deduction',
    calculationType: 'Percentage',
    taxable: false,
    status: 'Inactive',
  },
];

export const MOCK_SALARY_TEMPLATES: SalaryTemplate[] = [
  {
    id: '1',
    name: 'Standard CTC',
    description: 'Balanced structure for mid-level roles',
    totalComponents: 8,
    earningCount: 4,
    deductionCount: 2,
    status: 'Active',
  },
  {
    id: '2',
    name: 'Senior Leadership Pack',
    description: 'High-CTC structure with performance components',
    totalComponents: 6,
    earningCount: 3,
    deductionCount: 2,
    status: 'Active',
  },
];
