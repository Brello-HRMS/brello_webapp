import { AuditAction } from '../../enums/audit-action.enum';

import styles from './AuditActionBadge.module.css';

const GREEN_ACTIONS = new Set([
  AuditAction.CREATE,
  AuditAction.APPROVE,
  AuditAction.ACTIVATE,
  AuditAction.GRANT,
  AuditAction.ASSIGN,
  AuditAction.PAY,
  AuditAction.DISBURSE,
]);

const RED_ACTIONS = new Set([
  AuditAction.DELETE,
  AuditAction.REJECT,
  AuditAction.DEACTIVATE,
  AuditAction.REVOKE,
  AuditAction.UNASSIGN,
]);

const BLUE_ACTIONS = new Set([AuditAction.UPDATE, AuditAction.ADJUST]);

const YELLOW_ACTIONS = new Set([AuditAction.SUBMIT, AuditAction.PROCESS, AuditAction.LOCK]);

const ORANGE_ACTIONS = new Set([AuditAction.LOGIN_FAILED]);

const getActionColor = (action: string): string => {
  if (GREEN_ACTIONS.has(action as AuditAction)) return 'green';
  if (RED_ACTIONS.has(action as AuditAction)) return 'red';
  if (BLUE_ACTIONS.has(action as AuditAction)) return 'blue';
  if (YELLOW_ACTIONS.has(action as AuditAction)) return 'yellow';
  if (ORANGE_ACTIONS.has(action as AuditAction)) return 'orange';
  return 'gray';
};

interface AuditActionBadgeProps {
  action: string;
  className?: string;
}

export const AuditActionBadge = ({ action, className = '' }: AuditActionBadgeProps) => {
  const color = getActionColor(action);

  return (
    <span className={`${styles.badge} ${styles[color]} ${className}`}>
      {action.replace(/_/g, ' ')}
    </span>
  );
};
