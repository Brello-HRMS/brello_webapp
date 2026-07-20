import React from 'react';
import { useDroppable } from '@dnd-kit/core';

import { KanbanCardWrapper } from './KanbanCardWrapper';
import styles from './Kanban.module.scss';

import type { KanbanColumnDef } from './KanbanBoard';

interface KanbanColumnProps<T> {
  col: KanbanColumnDef;
  items: T[];
  getItemId: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  emptyStateText?: string;
  isDraggable: boolean;
}

export const KanbanColumn = <T,>({
  col,
  items,
  getItemId,
  renderCard,
  emptyStateText = 'No items in this stage',
  isDraggable,
}: KanbanColumnProps<T>) => {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.titleWrapper}>
          {col.color && (
            <div className={styles.colorIndicator} style={{ backgroundColor: col.color }} />
          )}
          <span>{col.title}</span>
        </div>
        <span className={styles.badge}>{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`${styles.columnContent} ${isOver ? styles.columnOver : ''}`}
      >
        {items.length === 0 ? (
          <div className={styles.emptyState}>{emptyStateText}</div>
        ) : (
          items.map((item) => (
            <KanbanCardWrapper
              key={getItemId(item)}
              item={item}
              itemId={getItemId(item)}
              renderCard={renderCard}
              isDraggable={isDraggable}
            />
          ))
        )}
      </div>
    </div>
  );
};
