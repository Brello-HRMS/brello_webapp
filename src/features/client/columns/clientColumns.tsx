import { TableActions, StatusBadge } from '../../../components/common';
import { Status } from '../../../types/common';

import type { ColumnDef } from '@tanstack/react-table';
import type { Client } from '../types/clientType';

interface ClientColumnProps {
  isMultiSelectActive: boolean;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const clientColumns = ({
  isMultiSelectActive,
  onView,
  onEdit,
  onDelete,
}: ClientColumnProps): ColumnDef<Client>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Client Name',
      size: 250,
      cell: (info) => {
        const name = info.getValue() as string;
        const logo = info.row.original.logo_url;
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: logo ? 'transparent' : 'var(--color-blue-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--color-blue-700)',
                overflow: 'hidden',
              }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </div>
            <span style={{ fontWeight: '500', color: 'var(--color-text-primary-500)' }}>
              {name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'poc_name',
      header: 'POC',
      size: 200,
      cell: (info) => (
        <span style={{ color: 'var(--color-secondary)' }}>{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'projects_count',
      header: 'Projects',
      size: 150,
      cell: (info) => {
        const count = (info.getValue() as number) || 0;
        return (
          <div
            style={{
              padding: '2px 12px',
              backgroundColor: 'var(--color-blue-50)',
              border: '1px solid var(--color-blue-200)',
              color: 'var(--color-blue-700)',
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: '150%',
              fontWeight: '500',
              display: 'inline-block',
            }}
          >
            {count}
          </div>
        );
      },
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
      size: 140,
      cell: (info) =>
        isMultiSelectActive ? null : (
          <TableActions
            onView={() => onView(info.row.original)}
            onEdit={() => onEdit(info.row.original)}
            onDelete={() => onDelete(info.row.original)}
          />
        ),
    },
  ];
};
