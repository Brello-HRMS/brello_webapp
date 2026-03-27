import { ProjectStatus, ProjectPriority, ProjectType } from '../types/projectType';

export const TYPE_OPTIONS = [
  { label: 'Internal', value: ProjectType.INTERNAL },
  { label: 'Client', value: ProjectType.CLIENT },
  { label: 'Fixed Price', value: ProjectType.FIXED_PRICE },
  { label: 'T&M', value: ProjectType.TM },
  { label: 'Agile', value: ProjectType.AGILE },
];

export const STATUS_OPTIONS = [
  { label: 'Draft', value: ProjectStatus.DRAFT },
  { label: 'Active', value: ProjectStatus.ACTIVE },
  { label: 'On Hold', value: ProjectStatus.ON_HOLD },
  { label: 'Completed', value: ProjectStatus.COMPLETED },
  { label: 'In Progress', value: ProjectStatus.IN_PROGRESS },
];

export const PRIORITY_OPTIONS = [
  { label: 'High', value: ProjectPriority.HIGH },
  { label: 'Medium', value: ProjectPriority.MEDIUM },
  { label: 'Low', value: ProjectPriority.LOW },
  { label: 'Urgent', value: ProjectPriority.URGENT },
];
