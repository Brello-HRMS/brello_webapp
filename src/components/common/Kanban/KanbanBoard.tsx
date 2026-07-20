import React, { useMemo } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, type DragEndEvent } from '@dnd-kit/core';

import { KanbanColumn } from './KanbanColumn';
import styles from './Kanban.module.scss';

export interface KanbanColumnDef {
  id: string;
  title: string;
  color?: string;
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumnDef[];
  items: T[];
  getItemId: (item: T) => string;
  getColumnId: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onItemDrop?: (item: T, targetColumnId: string) => void;
  emptyStateText?: string;
}

export const KanbanBoard = <T,>({
  columns,
  items,
  getItemId,
  getColumnId,
  renderCard,
  onItemDrop,
  emptyStateText,
}: KanbanBoardProps<T>) => {
  const groupedItems = useMemo(() => {
    const map = new Map<string, T[]>();
    columns.forEach((c) => map.set(c.id, []));

    items.forEach((item) => {
      const colId = getColumnId(item);
      if (map.has(colId)) {
        map.get(colId)?.push(item);
      }
    });

    return map;
  }, [items, columns, getColumnId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevents clicks from being interpreted as drags
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onItemDrop) return;

    const itemId = active.id as string;
    const targetColId = over.id as string;

    const item = items.find((i) => getItemId(i) === itemId);
    if (!item) return;

    onItemDrop(item, targetColId);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={styles.board}>
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            items={groupedItems.get(col.id) || []}
            getItemId={getItemId}
            renderCard={renderCard}
            emptyStateText={emptyStateText}
            isDraggable={!!onItemDrop}
          />
        ))}
      </div>
    </DndContext>
  );
};
