import { flexRender, type Table } from '@tanstack/react-table';
import { Pin, PinOff } from 'lucide-react';

import styles from '../DataTable.module.scss';

import { Resizer } from './Resizer';

interface TableHeadProps<TData> {
  table: Table<TData>;
}

export const TableHead = <TData,>({ table }: TableHeadProps<TData>) => {
  return (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isPinned = header.column.getIsPinned();
            return (
              <th
                key={header.id}
                colSpan={header.colSpan}
                className={`${styles.th} ${isPinned ? styles.pinnedHeader : ''}`}
                style={{
                  left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                  right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                  position: isPinned ? 'sticky' : 'relative',
                  zIndex: isPinned ? 10 : 1,
                  width: header.getSize(),
                  borderRight:
                    isPinned === 'left' ? '2px solid var(--color-primary-purple)' : undefined,
                  borderLeft:
                    isPinned === 'right' ? '2px solid var(--color-primary-purple)' : undefined,
                }}
              >
                <div className={styles.headerCellContent}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}

                  {!header.isPlaceholder && header.column.getCanPin() && (
                    <div className={styles.pinActions}>
                      {header.column.getIsPinned() ? (
                        <button onClick={() => header.column.pin(false)} title="Unpin">
                          <PinOff size={14} />
                        </button>
                      ) : (
                        <button onClick={() => header.column.pin('left')} title="Pin to Left">
                          <Pin size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <Resizer header={header} />
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};
