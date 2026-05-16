import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { type Table } from '@tanstack/react-table';

import styles from '../DataTable.module.scss';

import { PageSizeMenu } from './PageSizeMenu';

interface PaginationProps<TData> {
  table: Table<TData>;
}

export const Pagination = <TData,>({ table }: PaginationProps<TData>) => {
  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>
        Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
        {table.getPrePaginationRowModel().rows.length.toLocaleString()} Rows
      </div>

      <div className={styles.paginationControls}>
        <div className={styles.pageNavigation}>
          <button
            className={styles.pagiButton}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            className={styles.pagiButton}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft size={18} />
          </button>

          <span className={styles.pageInfo}>
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong>{table.getPageCount().toLocaleString()}</strong>
          </span>

          <button
            className={styles.pagiButton}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight size={18} />
          </button>
          <button
            className={styles.pagiButton}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        <PageSizeMenu table={table} />
      </div>
    </div>
  );
};
