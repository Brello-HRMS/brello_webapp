import { flexRender, type Table } from '@tanstack/react-table';

import styles from '../DataTable.module.scss';

interface TableBodyProps<TData> {
  table: Table<TData>;
}

export const TableBody = <TData,>({ table }: TableBodyProps<TData>) => {
  return (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <tr key={row.id} className={styles.row}>
          {row.getVisibleCells().map((cell) => {
            const isPinned = cell.column.getIsPinned();
            return (
              <td
                key={cell.id}
                className={`${styles.td} ${isPinned ? styles.pinnedCell : ''}`}
                style={{
                  left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                  right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                  position: isPinned ? 'sticky' : 'relative',
                  zIndex: isPinned ? 5 : 1,
                  borderRight:
                    isPinned === 'left' ? '2px solid var(--color-primary-purple)' : undefined,
                  borderLeft:
                    isPinned === 'right' ? '2px solid var(--color-primary-purple)' : undefined,
                  width: cell.column.getSize(),
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
};
