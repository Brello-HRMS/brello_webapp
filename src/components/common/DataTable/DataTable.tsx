import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getExpandedRowModel,
} from '@tanstack/react-table';

import styles from './DataTable.module.scss';

import type { ColumnPinningState, VisibilityState } from '@tanstack/react-table';
import type { DataTableProps } from './types';

export function DataTable<TData, TValue>({
  columns,
  data,
  rowIdField,
  className,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnPinning,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: rowIdField ? (row) => String(row[rowIdField as keyof TData]) : undefined,
    manualPagination: true,
  });

  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  return (
                    <th
                      key={header.id}
                      className={`${styles.th} ${isPinned ? styles.pinnedHeader : ''}`}
                      style={{
                        left:
                          isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                        right:
                          isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                        position: isPinned ? 'sticky' : 'relative',
                        zIndex: isPinned ? 10 : 1,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <tr className={`${styles.row} ${row.getIsExpanded() ? styles.expandedRow : ''}`}>
                  {row.getVisibleCells().map((cell) => {
                    const isPinned = cell.column.getIsPinned();
                    return (
                      <td
                        key={cell.id}
                        className={`${styles.td} ${isPinned ? styles.pinnedCell : ''}`}
                        style={{
                          left:
                            isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                          right:
                            isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                          position: isPinned ? 'sticky' : 'relative',
                          zIndex: isPinned ? 5 : 1,
                          paddingLeft:
                            cell.column.getIndex() === 0
                              ? `calc(var(--spacing-4) + ${row.depth * 24}px)`
                              : undefined,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
