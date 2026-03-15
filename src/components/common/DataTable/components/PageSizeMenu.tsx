import { type Table } from '@tanstack/react-table';

import { Select, type SelectOption } from '../../Select/Select';

interface PageSizeMenuProps<TData> {
  table: Table<TData>;
}

export const PageSizeMenu = <TData,>({ table }: PageSizeMenuProps<TData>) => {
  const pageSize = table.getState().pagination.pageSize;

  const options: SelectOption[] = [10, 20, 30, 40, 50].map((size) => ({
    label: String(size),
    value: size,
  }));

  return (
    <div style={{ minWidth: '140px' }}>
      <Select
        options={options}
        value={pageSize}
        onChange={(val) => table.setPageSize(Number(val))}
        labelPrefix="Show "
      />
    </div>
  );
};
