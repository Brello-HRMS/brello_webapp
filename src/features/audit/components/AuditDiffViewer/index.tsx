import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import styles from './AuditDiffViewer.module.css';

interface AuditDiffViewerProps {
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  changed_fields: string[] | null;
}

// Both snake_case (raw DB) and camelCase (TypeORM entity serialisation)
const NOISE_FIELDS = new Set([
  'id',
  // snake_case
  'enterprise_id',
  'organization_id',
  'created_at',
  'updated_at',
  'deleted_at',
  'deleted_by',
  'modified_at',
  'modified_by',
  // camelCase
  'enterpriseId',
  'organizationId',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedBy',
  'modifiedAt',
  'modifiedBy',
  '__v',
]);

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    if (value.length === 0) return '(empty)';
    return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
  }
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
      return new Date(value).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
    return value || '—';
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

// Handles both snake_case and camelCase field names
const toLabel = (field: string) =>
  field
    .replace(/([A-Z])/g, ' $1') // split camelCase: "pocName" → "poc Name"
    .replace(/_/g, ' ') // snake_case → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const hasChanged = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);

export const AuditDiffViewer = ({
  action,
  old_value,
  new_value,
  changed_fields,
}: AuditDiffViewerProps) => {
  const [showAll, setShowAll] = useState(false);

  if (!old_value && !new_value) return null;

  // Use action to drive display mode — don't guess from null checks.
  const isCreate = action === 'CREATE';
  const isDelete = action === 'DELETE';
  const isUpdate = !isCreate && !isDelete;

  const allFields = changed_fields?.length
    ? changed_fields
    : Object.keys({ ...old_value, ...new_value });

  const primaryFields = allFields.filter((f) => !NOISE_FIELDS.has(f));
  const noiseFields = allFields.filter((f) => NOISE_FIELDS.has(f));
  const visibleFields = showAll ? allFields : primaryFields;

  if (primaryFields.length === 0 && noiseFields.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      {/* ── Mode badge ── */}
      <div className={styles.modeBar}>
        {isCreate && <span className={styles.modeBadgeCreate}>Created</span>}
        {isDelete && <span className={styles.modeBadgeDelete}>Deleted</span>}
        {isUpdate && <span className={styles.modeBadgeUpdate}>Updated</span>}

        {isUpdate && !old_value && (
          <span className={styles.noBeforeNote}>Before state not captured for this event</span>
        )}
      </div>

      {/* ── Field rows ── */}
      <div className={styles.rows}>
        {visibleFields.map((field) => {
          const oldVal = old_value?.[field];
          const newVal = new_value?.[field];

          // Skip entirely-null rows for CREATE/DELETE
          if (isCreate && (newVal === null || newVal === undefined)) return null;
          if (isDelete && (oldVal === null || oldVal === undefined)) return null;

          const changed = isUpdate && hasChanged(oldVal, newVal);

          return (
            <div key={field} className={`${styles.row} ${changed ? styles.rowChanged : ''}`}>
              <span className={styles.fieldLabel}>{toLabel(field)}</span>

              {isCreate && <span className={styles.valueNew}>{formatValue(newVal)}</span>}

              {isDelete && <span className={styles.valueOld}>{formatValue(oldVal)}</span>}

              {isUpdate && (
                <div className={styles.diffPair}>
                  <span className={styles.valueOld}>{formatValue(oldVal)}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.valueNew}>{formatValue(newVal)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── System fields toggle ── */}
      {noiseFields.length > 0 && (
        <button className={styles.toggleBtn} onClick={() => setShowAll((v) => !v)}>
          {showAll ? (
            <>
              <ChevronUp size={13} /> Hide system fields
            </>
          ) : (
            <>
              <ChevronDown size={13} /> Show {noiseFields.length} system fields
            </>
          )}
        </button>
      )}
    </div>
  );
};
