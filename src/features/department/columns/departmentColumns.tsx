import { Users } from 'lucide-react';

import { StatusBadge } from '../../../components/common';
import { Status } from '../../../types/common';
import { ActionsCell } from '../components/ActionsCell';

import type { ColumnDef } from '@tanstack/react-table';
import type { Department } from '../types/departmentType';

export const departmentColumns: ColumnDef<Department>[] = [
  {
    accessorKey: 'name',
    header: 'Department Name',
    size: 250,
    cell: (info) => {
      const department = info.row.original;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          {department.icon ? (
            <img
              src={department.icon}
              alt=""
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-gray-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-icon-gray)',
              }}
            >
              <Users size={16} />
            </div>
          )}
          <span>{info.getValue() as string}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'code',
    header: 'Code',
    size: 150,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 350,
    cell: (info) => (
      <div
        style={{
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={info.getValue() as string}
      >
        {info.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: (info) => {
      const status = info.getValue() as Status;
      return <StatusBadge status={status} />;
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 150,
    cell: ActionsCell,
  },
];
