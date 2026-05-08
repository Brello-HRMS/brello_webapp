import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, Button, WarningModal, TableActions } from '../../../../components/common';
import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { Status } from '../../../../types/common';
import { useShifts } from '../hooks/useShifts';
import { formatTime } from '../../../../utils/timeUtils';

import styles from './ShiftsTab.module.scss';
import CreateShiftModal from './CreateShiftModal';

import type { IShift } from '../types/setupTypes';
import type { ColumnDef } from '@tanstack/react-table';

const ShiftsTab = ({
  setHeaderActions,
}: {
  setHeaderActions: (actions: React.ReactNode) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<IShift | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<IShift | null>(null);

  const { shifts, deleteShift, isDeleting } = useShifts();

  const handleCreate = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    setHeaderActions(
      <Button onClick={handleCreate} variant="primary">
        <Plus size={16} style={{ marginRight: '8px' }} />
        Create shift
      </Button>,
    );
  }, [setHeaderActions]);

  const handleEdit = (shift: IShift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };
  const handleDeleteClick = (shift: IShift) => {
    setShiftToDelete(shift);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!shiftToDelete) return;
    try {
      await deleteShift(shiftToDelete.id);
    } catch {
      /* toast in hook */
    }
    setIsDeleteModalOpen(false);
    setShiftToDelete(null);
  };

  const columns = useMemo<ColumnDef<IShift>[]>(
    () => [
      { accessorKey: 'name', header: 'Shift Name', cell: (info) => info.getValue() || '-' },
      {
        accessorKey: 'start_time',
        header: 'Start',
        cell: (info) => formatTime(info.getValue() as string),
      },
      {
        accessorKey: 'end_time',
        header: 'End',
        cell: (info) => formatTime(info.getValue() as string),
      },
      {
        accessorKey: 'hours',
        header: 'Hours',
        cell: (info) =>
          info.row.original.full_day_hours ? `${info.row.original.full_day_hours} hrs` : '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue() as Status} />,
      },
      {
        id: 'action',
        header: 'Action',
        cell: (info) => (
          <TableActions
            onEdit={() => handleEdit(info.row.original)}
            onDelete={() => handleDeleteClick(info.row.original)}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.container}>
      <DataTable columns={columns} data={shifts} rowIdField="id" />

      <CreateShiftModal
        key={editingShift?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingShift}
      />

      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Shift"
        description={`Are you sure you want to delete "${shiftToDelete?.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleConfirmDelete}
        isActionLoading={isDeleting}
      />
    </div>
  );
};

export default ShiftsTab;
