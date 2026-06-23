import React from 'react';
import { Clock, Globe, Hash, ShieldCheck } from 'lucide-react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { formatDateTime } from '../../../../utils/timeUtils';
import { AuditModuleBadge } from '../AuditModuleBadge';
import { AuditActionBadge } from '../AuditActionBadge';
import { AuditDiffViewer } from '../AuditDiffViewer';

import styles from './AuditDetailDrawer.module.css';

import type { AuditLog } from '../../types/audit.types';

interface AuditDetailDrawerProps {
  log: AuditLog | null;
  onClose: () => void;
}

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const toLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const AuditDetailDrawer = ({ log, onClose }: AuditDetailDrawerProps) => (
  <Dialog title="Audit Log Detail" open={!!log} onClose={onClose} position="right" maxWidth="580px">
    {log && (
      <div className={styles.body}>
        {/* ── Event identity ── */}
        <div className={styles.eventHeader}>
          <div className={styles.badgeRow}>
            <AuditModuleBadge module={log.module} />
            <AuditActionBadge action={log.action} />
          </div>
          <p className={styles.entityLine}>
            <span className={styles.entityType}>{toLabel(log.entity_type)}</span>
            {log.entity_display_name && (
              <span className={styles.entityName}>{log.entity_display_name}</span>
            )}
          </p>
          <code className={styles.entityId}>{log.entity_id}</code>
        </div>

        <div className={styles.divider} />

        {/* ── Actor ── */}
        <div className={styles.actorSection}>
          <div className={styles.avatar}>{initials(log.actor_name)}</div>
          <div className={styles.actorInfo}>
            <span className={styles.actorName}>
              {log.actor_name}
              {log.is_platform_admin && (
                <span className={styles.adminBadge}>
                  <ShieldCheck size={11} /> Platform Admin
                </span>
              )}
            </span>
            <span className={styles.actorEmail}>{log.actor_email}</span>
          </div>
        </div>

        <div className={styles.metaChips}>
          <span className={styles.chip}>
            <Clock size={11} />
            {formatDateTime(log.created_at)}
          </span>
          {log.ip_address && (
            <span className={styles.chip}>
              <Globe size={11} />
              {log.ip_address}
            </span>
          )}
          {log.request_id && (
            <span className={styles.chip}>
              <Hash size={11} />
              <code className={styles.chipCode}>{log.request_id}</code>
            </span>
          )}
        </div>

        {log.description && (
          <>
            <div className={styles.divider} />
            <p className={styles.description}>{log.description}</p>
          </>
        )}

        {/* ── Changes ── */}
        {(log.old_value || log.new_value) && (
          <>
            <div className={styles.divider} />
            <div className={styles.changesSection}>
              <p className={styles.sectionLabel}>Changes</p>
              <AuditDiffViewer
                action={log.action}
                old_value={log.old_value}
                new_value={log.new_value}
                changed_fields={log.changed_fields}
              />
            </div>
          </>
        )}
      </div>
    )}
  </Dialog>
);
