import { AuditLogModule } from '../../enums/audit-log-module.enum';

import styles from './AuditModuleBadge.module.css';

const MODULE_COLOR_MAP: Record<string, string> = {
  [AuditLogModule.AUTH]: 'red',
  [AuditLogModule.SESSION]: 'red',
  [AuditLogModule.EMPLOYEE]: 'purple',
  [AuditLogModule.ORGANIZATION]: 'purple',
  [AuditLogModule.DEPARTMENT]: 'purple',
  [AuditLogModule.DESIGNATION]: 'purple',
  [AuditLogModule.ROLE]: 'orange',
  [AuditLogModule.PERMISSION]: 'orange',
  [AuditLogModule.USER_ROLE]: 'orange',
  [AuditLogModule.LEAVE_CONFIG]: 'teal',
  [AuditLogModule.LEAVE_REQUEST]: 'teal',
  [AuditLogModule.LEAVE_BALANCE]: 'teal',
  [AuditLogModule.ATTENDANCE]: 'blue',
  [AuditLogModule.SHIFT]: 'blue',
  [AuditLogModule.PAYROLL]: 'green',
  [AuditLogModule.SALARY]: 'green',
  [AuditLogModule.REIMBURSEMENT]: 'green',
  [AuditLogModule.PLATFORM_ENTERPRISE]: 'gray',
  [AuditLogModule.PLATFORM_PLAN]: 'gray',
  [AuditLogModule.PLATFORM_SETUP]: 'gray',
};

const getModuleLabel = (module: string): string => module.replace(/_/g, ' ');

interface AuditModuleBadgeProps {
  module: string;
  className?: string;
}

export const AuditModuleBadge = ({ module, className = '' }: AuditModuleBadgeProps) => {
  const color = MODULE_COLOR_MAP[module] ?? 'default';

  return (
    <span className={`${styles.badge} ${styles[color]} ${className}`}>
      {getModuleLabel(module)}
    </span>
  );
};
