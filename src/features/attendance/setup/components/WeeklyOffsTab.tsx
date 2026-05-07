import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, Button, WarningModal, TableActions } from '../../../../components/common';
import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { Status } from '../../../../types/common';
import { useWeeklyOffs } from '../hooks/useWeeklyOffs';

import styles from './ShiftsTab.module.scss';
import CreateWeeklyOffModal from './CreateWeeklyOffModal';

import type { IWeeklyOff } from '../types/setupTypes';
import type { ColumnDef } from '@tanstack/react-table';

const SAT_RULE_LABELS: Record<string, string> = {
  ODD_OFF: '1st, 3rd & 5th Saturdays off',
  EVEN_OFF: '2nd & 4th Saturdays off',
};

const formatDaysOff = (row: IWeeklyOff): string => {
  const days = (row.days ?? [])
    .map((d) => d.charAt(0) + d.slice(1).toLowerCase())
    .filter((d) => d.toLowerCase() !== 'saturday');

  const parts = [...days];

  if (row.saturday_rule && row.saturday_rule !== 'ALL_WORKING' && row.saturday_rule !== 'ALL_OFF') {
    if (row.saturday_rule === 'CUSTOM' && row.saturday_off_weeks?.length) {
      const labels = ['1st', '2nd', '3rd', '4th', '5th'];
      parts.push(`${row.saturday_off_weeks.map((w) => labels[w - 1]).join(', ')} Saturdays off`);
    } else if (SAT_RULE_LABELS[row.saturday_rule]) {
      parts.push(SAT_RULE_LABELS[row.saturday_rule]);
    }
  } else if (row.days?.some((d) => d.toUpperCase() === 'SATURDAY')) {
    parts.push('Saturday');
  }

  return parts.length === 0 ? '-' : parts.join(', ');
};

const WeeklyOffsTab = ({
  setHeaderActions,
}: {
  setHeaderActions: (actions: React.ReactNode) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWeeklyOff, setEditingWeeklyOff] = useState<IWeeklyOff | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [weeklyOffToDelete, setWeeklyOffToDelete] = useState<IWeeklyOff | null>(null);

  const { weeklyOffs, deleteWeeklyOff, isDeleting } = useWeeklyOffs();

  const handleCreate = () => {
    setEditingWeeklyOff(null);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    setHeaderActions(
      <Button onClick={handleCreate} variant="primary">
        <Plus size={16} style={{ marginRight: '8px' }} />
        Create pattern
      </Button>,
    );
  }, [setHeaderActions]);

  const handleEdit = (w: IWeeklyOff) => {
    setEditingWeeklyOff(w);
    setIsModalOpen(true);
  };
  const handleDeleteClick = (w: IWeeklyOff) => {
    setWeeklyOffToDelete(w);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!weeklyOffToDelete) return;
    try {
      await deleteWeeklyOff(weeklyOffToDelete.id);
    } catch {
      /* toast in hook */
    }
    setIsDeleteModalOpen(false);
    setWeeklyOffToDelete(null);
  };

  const columns = useMemo<ColumnDef<IWeeklyOff>[]>(
    () => [
      { accessorKey: 'name', header: 'Pattern Name', cell: (info) => info.getValue() || '-' },
      { id: 'days_off', header: 'Days Off', cell: (info) => formatDaysOff(info.row.original) },
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
      <DataTable columns={columns} data={weeklyOffs} rowIdField="id" />

      <CreateWeeklyOffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingWeeklyOff}
      />

      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Weekly Off Pattern"
        description={`Are you sure you want to delete "${weeklyOffToDelete?.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleConfirmDelete}
        isActionLoading={isDeleting}
      />
    </div>
  );
};

export default WeeklyOffsTab;
