import { TableActions, StatusBadge } from '../../../components/common';
import { resolveAssetUrl } from '../../../utils/assetUrl';

import type { ColumnDef } from '@tanstack/react-table';
import type { Employee } from '../types/employeeType';

interface EmployeeColumnProps {
  isMultiSelectActive: boolean;
  onView?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export const employeeColumns = ({
  isMultiSelectActive,
  onView,
  onEdit,
  onDelete,
}: EmployeeColumnProps): ColumnDef<Employee>[] => {
  return [
    {
      id: 'employee',
      header: 'Employee',
      size: 250,
      cell: (info) => {
        const { firstName, lastName, avatar, id, role } = info.row.original;
        const shortId = `EMP-${id.substring(0, 3).toUpperCase()}`; // Simulating a readable ID

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            {avatar ? (
              <img
                src={resolveAssetUrl(avatar) ?? undefined}
                alt={`${firstName} ${lastName}`}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-100)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {firstName} {lastName}
              </span>
              <span
                style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}
              >
                ID: {shortId} • {role || 'Not Specified'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 150,
      cell: (info) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {(info.getValue() as string) || 'Not Specified'}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      size: 120,
      cell: (info) => {
        const type = (info.getValue() as string) || 'Full-time';
        return (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: 'var(--font-size-xs)',
              backgroundColor: 'var(--color-blue-50)',
              color: 'var(--color-blue-600)',
              fontWeight: 500,
            }}
          >
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'employeeStatus',
      header: 'Status',
      size: 120,
      cell: (info) => {
        const empStatus = info.getValue() as string;
        const status = empStatus || info.row.original.status;
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      size: 150,
      cell: (info) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {(info.getValue() as string) || 'Not Specified'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: (info) =>
        isMultiSelectActive ? null : (
          <TableActions
            onView={onView ? () => onView(info.row.original) : undefined}
            onEdit={onEdit ? () => onEdit(info.row.original) : undefined}
            onDelete={onDelete ? () => onDelete(info.row.original) : undefined}
          />
        ),
    },
  ];
};
