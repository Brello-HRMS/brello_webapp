import { ActionCell } from '../components/ActionCell';

import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '../../users/types/userType';

export const employeeColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'Employee ID',
    size: 150,
    cell: (info) => {
      // API doesn't return a specific "employeeId", fallback to first 8 chars of id or UUID mapping if applicable
      const id = info.getValue() as string;
      return <span style={{ fontSize: '13px' }}>{id.split('-')[0]}</span>;
    },
  },
  {
    id: 'name',
    header: 'Employee Name',
    size: 250,
    cell: (info) => {
      const user = info.row.original;
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <img
            src={avatarUrl}
            alt={fullName}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <span>{fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 200,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    size: 150,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: (info) => {
      const status = info.getValue() as string;
      const isActive = status === 'ACTIVE';
      return (
        <span
          style={{
            color: isActive ? 'var(--color-primary-500)' : 'var(--color-warning-500)',
            fontWeight: 500,
          }}
        >
          {status || 'N/A'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 100,
    cell: (info) => <ActionCell employeeId={info.row.original.id} />,
  },
];
