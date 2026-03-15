import React from 'react';

import { TableActions } from '../../../components/common';
import { useDeleteDepartment } from '../hooks/useDeleteDepartment';

import type { Department } from '../types/departmentType';

interface ActionsCellProps {
  row: {
    original: Department;
  };
}

export const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
  const { mutate: deleteDept, isPending } = useDeleteDepartment();

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteDept(row.original.id);
    }
  };

  return (
    <TableActions
      onView={() => {}}
      onEdit={() => {}}
      onDelete={handleDelete}
      isLoading={isPending}
    />
  );
};
