import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnPinningState,
  type VisibilityState,
  type PaginationState,
} from '@tanstack/react-table';

import styles from './DataTable.module.scss';
import { TableHead } from './components/TableHead';
import { TableBody } from './components/TableBody';
import { VisibilityMenu } from './components/VisibilityMenu';
import { Pagination } from './components/Pagination';

import type { DataTableProps } from './types';

export const DataTable = <TData, TValue>({
  columns,
  data,
  rowIdField,
  className,
  columnResizeMode = 'onChange',
  pagination,
  onPaginationChange,
  pageCount,
  manualPagination = false,
}: DataTableProps<TData, TValue>) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  });
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnPinning,
      pagination: pagination || internalPagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination || internalPagination) : updater;
      if (onPaginationChange) {
        onPaginationChange(next);
      } else {
        setInternalPagination(next);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: rowIdField ? (row) => String(row[rowIdField as keyof TData]) : undefined,
    columnResizeMode,
    manualPagination,
    pageCount,
  });

  return (
    <div className={`${styles.tableContainer} ${className || ''}`}>
      <div className={styles.tableControls}>
        <VisibilityMenu table={table} />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table} style={{ width: table.getTotalSize() }}>
          <TableHead table={table} />
          <TableBody table={table} />
        </table>
      </div>

      <Pagination table={table} />
    </div>
  );
};
