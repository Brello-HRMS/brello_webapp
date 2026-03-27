export const ProjectStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  URGENT: 'URGENT',
} as const;
export type ProjectPriority = (typeof ProjectPriority)[keyof typeof ProjectPriority];

export const ProjectType = {
  INTERNAL: 'INTERNAL',
  CLIENT: 'CLIENT',
  FIXED_PRICE: 'FIXED_PRICE',
  TM: 'TM',
  AGILE: 'AGILE',
} as const;
export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];
