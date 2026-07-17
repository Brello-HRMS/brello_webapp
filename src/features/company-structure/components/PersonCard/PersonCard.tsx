import { Users } from 'lucide-react';

import { getAvatarColor, getInitials } from '../../utils/personUtils';

import styles from './PersonCard.module.scss';

import type { HierarchyNode } from '../../types/hierarchyType';

interface PersonCardProps {
  node: HierarchyNode;
  /** Compact variant for list rows. */
  compact?: boolean;
  selected?: boolean;
  onClick?: (node: HierarchyNode) => void;
}

export const PersonCard = ({ node, compact, selected, onClick }: PersonCardProps) => {
  const clickable = Boolean(onClick);

  return (
    <div
      className={[
        styles.card,
        compact ? styles.compact : '',
        selected ? styles.selected : '',
        clickable ? styles.clickable : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick ? () => onClick(node) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(node);
              }
            }
          : undefined
      }
    >
      {node.avatar ? (
        <img className={styles.avatar} src={node.avatar} alt={node.fullName} />
      ) : (
        <span
          className={styles.avatarFallback}
          style={{ backgroundColor: getAvatarColor(node.id) }}
        >
          {getInitials(node)}
        </span>
      )}

      <div className={styles.info}>
        <span className={styles.name} title={node.fullName}>
          {node.fullName}
        </span>
        <span className={styles.role} title={node.designation ?? ''}>
          {node.designation ?? 'No designation'}
          {node.department ? ` · ${node.department}` : ''}
        </span>
      </div>

      {node.directReportsCount > 0 && (
        <span
          className={styles.reportBadge}
          title={`${node.directReportsCount} direct · ${node.totalReportsCount} total reportees`}
        >
          <Users size={12} />
          {node.directReportsCount}
        </span>
      )}
    </div>
  );
};
