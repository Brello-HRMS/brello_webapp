import { flexRender, type Table } from '@tanstack/react-table';

import styles from '../DataTable.module.scss';

interface TableBodyProps<TData> {
  table: Table<TData>;
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
}

const SKELETON_ROW_COUNT = 6;

export const TableBody = <TData,>({ table, onRowClick, isLoading }: TableBodyProps<TData>) => {
  const visibleColumns = table.getVisibleLeafColumns();

  // While loading with no data yet, show skeleton rows instead of flashing the
  // "No results found" empty state before the first response arrives.
  if (isLoading && table.getRowModel().rows.length === 0) {
    return (
      <tbody>
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
          <tr key={`skeleton-${rowIndex}`} className={styles.row}>
            {visibleColumns.map((column) => (
              <td key={column.id} className={styles.td} style={{ width: column.getSize() }}>
                <span className={styles.skeletonCell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <tbody>
      {table.getRowModel().rows.length > 0 ? (
        table.getRowModel().rows.map((row) => {
          const isSelected = row.getIsSelected();
          return (
            <tr
              key={row.id}
              className={`${styles.row} ${isSelected ? styles.selectedRow : ''} ${
                onRowClick ? styles.clickableRow : ''
              }`}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(row.original);
                } else if (row.getCanSelect()) {
                  row.toggleSelected();
                }
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const isPinned = cell.column.getIsPinned();
                return (
                  <td
                    key={cell.id}
                    className={`${styles.td} ${isPinned ? styles.pinnedCell : ''}`}
                    style={{
                      left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                      right:
                        isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
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
          );
        })
      ) : (
        <tr>
          <td colSpan={table.getAllColumns().length}>
            <div className={styles.noResults}>
              <p>No results found</p>
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
};
