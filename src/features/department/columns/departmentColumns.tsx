import { TableActions } from '../../../components/common';
import { StatusBadge } from '../../../components/common';
import { Status } from '../../../types/common';

import type { ColumnDef } from '@tanstack/react-table';
import type { Department } from '../types/departmentType';

interface DepartmentColumnProps {
  isMultiSelectActive: boolean;
  onView: (department: Department) => void;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
}

export const departmentColumns = ({
  isMultiSelectActive,
  onView,
  onEdit,
  onDelete,
}: DepartmentColumnProps): ColumnDef<Department>[] => {
  return [
    {
      accessorKey: 'code',
      header: 'Code',
      size: 150,
      cell: (info) => (
        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Department Name',
      size: 250,
      cell: (info) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <span>{info.getValue() as string}</span>
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
      id: 'members',
      header: 'Members',
      size: 150,
      cell: (info) => {
        const count = info.row.original.memberAvatars?.length || 0;
        return <span>{count} members</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: (info) =>
        isMultiSelectActive ? null : (
          <TableActions
            onView={() => onView(info.row.original)}
            onEdit={onEdit ? () => onEdit(info.row.original) : undefined}
            onDelete={onDelete ? () => onDelete(info.row.original) : undefined}
          />
        ),
    },
  ];
};
