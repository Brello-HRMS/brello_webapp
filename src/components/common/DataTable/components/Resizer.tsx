import styles from '../DataTable.module.scss';

import type { Header } from '@tanstack/react-table';

interface ResizerProps<TData, TValue> {
  header: Header<TData, TValue>;
}

export const Resizer = <TData, TValue>({ header }: ResizerProps<TData, TValue>) => {
  if (!header.column.getCanResize()) return null;

  return (
    <div
      {...{
        onDoubleClick: () => header.column.resetSize(),
        onMouseDown: header.getResizeHandler(),
        onTouchStart: header.getResizeHandler(),
        className: `${styles.resizer} ${header.column.getIsResizing() ? styles.isResizing : ''}`,
      }}
    />
  );
};
