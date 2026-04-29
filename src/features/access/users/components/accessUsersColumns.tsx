import { TableActions } from '../../../../components/common';

import type { ColumnDef } from '@tanstack/react-table';
import type { AccessUser } from '../types';

const ROLE_COLORS = [
  {
    bg: 'var(--color-primary-100)',
    text: 'var(--color-primary-700)',
    border: 'var(--color-primary-200)',
  },
  { bg: 'var(--color-error-50)', text: 'var(--color-error-700)', border: 'var(--color-error-200)' },
  {
    bg: 'var(--color-success-50)',
    text: 'var(--color-success-700)',
    border: 'var(--color-success-200)',
  },
  { bg: 'var(--color-gray-50)', text: 'var(--color-gray-700)', border: 'var(--color-border)' },
  { bg: 'var(--color-blue-50)', text: 'var(--color-blue-700)', border: 'var(--color-blue-200)' },
];

interface AccessUsersColumnsProps {
  onEdit: (user: AccessUser) => void;
  onDelete: (user: AccessUser) => void;
}

export const accessUsersColumns = ({
  onEdit,
  onDelete,
}: AccessUsersColumnsProps): ColumnDef<AccessUser>[] => [
  {
    id: 'employee',
    header: 'Employee',
    size: 250,
    cell: (info) => {
      const user = info.row.original;
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <img
            src={avatarUrl}
            alt={fullName}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: (info) => (
      <span style={{ color: 'var(--color-text-secondary)' }}>{info.getValue() as string}</span>
    ),
  },
  {
    id: 'assignedRoles',
    header: 'Assigned roles',
    cell: (info) => {
      const roles = info.row.original.assignedRoles;
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {roles.map((role, index) => {
            const color = ROLE_COLORS[index % ROLE_COLORS.length];
            return (
              <span
                key={role.mappingId}
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  border: `1px solid ${color.border}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {role.name}
              </span>
            );
          })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Action',
    size: 100,
    cell: (info) => (
      <TableActions
        onEdit={() => onEdit(info.row.original)}
        onDelete={() => onDelete(info.row.original)}
      />
    ),
  },
];
