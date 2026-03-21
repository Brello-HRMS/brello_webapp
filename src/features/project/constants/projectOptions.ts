import { DUMMY_EMPLOYEES } from '../../department/data/dummyEmployees';

export const TYPE_OPTIONS = [
  { label: 'Internal', value: 'Internal' },
  { label: 'Client', value: 'Client' },
  { label: 'Fixed Price', value: 'Fixed Price' },
  { label: 'T&M', value: 'T&M' },
];

export const STATUS_OPTIONS = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'On Hold', value: 'ON_HOLD' },
  { label: 'Completed', value: 'COMPLETED' },
];

export const PRIORITY_OPTIONS = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

export const EMPLOYEE_OPTIONS = DUMMY_EMPLOYEES.map((emp) => ({
  label: emp.name,
  value: emp.id,
  description: emp.designation,
}));
