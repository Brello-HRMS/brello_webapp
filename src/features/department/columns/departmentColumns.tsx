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
      cell: (info) => {
        const code = info.getValue() as string;
        return (
          <span
            title={code}
            style={{
              display: 'block',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {code}
          </span>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Department Name',
      size: 250,
      cell: (info) => {
        const name = info.getValue() as string;
        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', minWidth: 0 }}
          >
            <span
              title={name}
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {name}
            </span>
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
