import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface KanbanCardWrapperProps<T> {
  item: T;
  itemId: string;
  renderCard: (item: T) => React.ReactNode;
  isDraggable: boolean;
}

export const KanbanCardWrapper = <T,>({
  item,
  itemId,
  renderCard,
  isDraggable,
}: KanbanCardWrapperProps<T>) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: itemId,
    data: { item },
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 100 : undefined,
    position: isDragging ? ('relative' as const) : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
    >
      {renderCard(item)}
    </div>
  );
};
