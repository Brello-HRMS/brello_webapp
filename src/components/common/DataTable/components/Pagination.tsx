import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Table } from '@tanstack/react-table';

import styles from '../DataTable.module.scss';

interface PaginationProps<TData> {
  table: Table<TData>;
}

export const Pagination = <TData,>({ table }: PaginationProps<TData>) => {
  return (
    <div className={styles.pagination}>
      <div className={styles.pageNumbers}>
        {Array.from({ length: table.getPageCount() }, (_, i) => (
          <button
            key={i}
            className={`${styles.pageNumberBtn} ${
              table.getState().pagination.pageIndex === i ? styles.active : ''
            }`}
            onClick={() => table.setPageIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className={styles.paginationControls}>
        <button
          className={styles.navButton}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        <button
          className={styles.navButton}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
