import { TableActions } from '../../../components/common';
import { StatusBadge } from '../../../components/common';
import { Status } from '../../../types/common';

import type { ColumnDef } from '@tanstack/react-table';
import type { Designation } from '../types/designationType';

interface DesignationColumnProps {
  isMultiSelectActive: boolean;
  onView: (designation: Designation) => void;
  onEdit: (designation: Designation) => void;
  onDelete: (designation: Designation) => void;
}

export const designationColumns = ({
  isMultiSelectActive,
  onView,
  onEdit,
  onDelete,
}: DesignationColumnProps): ColumnDef<Designation>[] => {
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
      accessorKey: 'title',
      header: 'Designation Title',
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
      id: 'actions',
      header: 'Actions',
      size: 100,
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
