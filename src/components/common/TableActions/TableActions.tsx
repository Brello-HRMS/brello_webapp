import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';

import styles from './TableActions.module.scss';

interface TableActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export const TableActions: React.FC<TableActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  return (
    <div className={styles.container}>
      {onView && (
        <button className={styles.actionButton} onClick={onView} title="View" disabled={isLoading}>
          <Eye size={18} />
        </button>
      )}
      {onEdit && (
        <button className={styles.actionButton} onClick={onEdit} title="Edit" disabled={isLoading}>
          <Edit2 size={18} />
        </button>
      )}
      {onDelete && (
        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={onDelete}
          title="Delete"
          disabled={isLoading}
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};
