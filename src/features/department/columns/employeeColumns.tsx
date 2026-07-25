import { ActionCell } from '../components/ActionCell';

import type { ColumnDef } from '@tanstack/react-table';
import type { Employee } from '../../employee/types/employeeType';

export const employeeColumns: ColumnDef<Employee>[] = [
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
    size: 220,
    cell: (info) => {
      const email = (info.getValue() as string) || '—';
      return (
        <span
          title={email}
          style={{
            display: 'block',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </span>
      );
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    size: 160,
    cell: (info) => {
      const phone = (info.getValue() as string) || '—';
      return (
        <span
          title={phone}
          style={{
            display: 'block',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {phone}
        </span>
      );
    },
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
