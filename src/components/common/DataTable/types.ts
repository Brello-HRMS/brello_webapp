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
}
