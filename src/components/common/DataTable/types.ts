import type { ColumnDef, ColumnResizeMode } from '@tanstack/react-table';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowIdField?: keyof TData;
  className?: string;
  columnResizeMode?: ColumnResizeMode;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  pageCount?: number;
  manualPagination?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;
  onRowClick?: (row: TData) => void;
  /** Show skeleton rows instead of the empty "No results" state while data is loading. */
  isLoading?: boolean;
  /**
   * Controlled column visibility (columnId -> visible). Lets the parent read which
   * columns are currently shown (e.g. to export only the visible columns). When
   * omitted, the table manages visibility internally.
   */
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
}
