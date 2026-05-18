import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, Button, WarningModal, TableActions } from '../../../../components/common';
import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { Status } from '../../../../types/common';
import { useRules } from '../hooks/useRules';

import styles from './ShiftsTab.module.scss';
import CreateRuleModal from './CreateRuleModal';

import type { IRule } from '../types/setupTypes';
import type { ColumnDef } from '@tanstack/react-table';

const RulesTab = ({
  setHeaderActions,
}: {
  setHeaderActions: (actions: React.ReactNode) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IRule | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<IRule | null>(null);

  const { rules, deleteRule, isDeleting } = useRules();

  const handleCreate = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    setHeaderActions(
      <Button onClick={handleCreate} variant="primary">
        <Plus size={16} style={{ marginRight: '8px' }} />
        Create rule
      </Button>,
    );
  }, [setHeaderActions]);

  const handleEdit = (rule: IRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };
  const handleDeleteClick = (rule: IRule) => {
    setRuleToDelete(rule);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await deleteRule(ruleToDelete.id);
    } catch {
      /* toast in hook */
    }
    setIsDeleteModalOpen(false);
    setRuleToDelete(null);
  };

  const columns = useMemo<ColumnDef<IRule>[]>(
    () => [
      { accessorKey: 'name', header: 'Rule Name', cell: (info) => info.getValue() || '-' },
      {
        accessorKey: 'shift_id',
        header: 'Shift',
        cell: (info) => info.row.original.shift?.name || '-',
      },
      {
        accessorKey: 'weekly_off_id',
        header: 'Weekly Off',
        cell: (info) => info.row.original.weekly_off?.name || '-',
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
      <DataTable columns={columns} data={rules} rowIdField="id" />

      <CreateRuleModal
        key={editingRule?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingRule}
      />

      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Attendance Rule"
        description={`Are you sure you want to delete "${ruleToDelete?.name}"? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleConfirmDelete}
        isActionLoading={isDeleting}
      />
    </div>
  );
};

export default RulesTab;
