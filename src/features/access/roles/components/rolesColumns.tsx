import moment from 'moment';

import { TableActions } from '../../../../components/common';

import type { ColumnDef } from '@tanstack/react-table';
import type { Role } from '../types';

interface RolesColumnsProps {
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

export const rolesColumns = ({ onEdit, onDelete }: RolesColumnsProps): ColumnDef<Role>[] => [
  {
    accessorKey: 'name',
    header: 'Role Name',
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: (info) => (
      <div
        style={{
          color: 'var(--color-text-secondary)',
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {info.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last updated',
    cell: (info) => {
      const val = info.getValue() as string;
      return val ? moment(val).format('MMM D, YYYY') : '-';
    },
  },
  {
    id: 'actions',
    header: 'Action',
    cell: (info) => (
      <TableActions
        onEdit={onEdit ? () => onEdit(info.row.original) : undefined}
        onDelete={onDelete ? () => onDelete(info.row.original) : undefined}
      />
    ),
  },
];
