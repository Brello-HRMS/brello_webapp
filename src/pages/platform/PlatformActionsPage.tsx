import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import {
  Button,
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  TableActions,
  WarningModal,
} from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { ActionFormModal } from '../../features/platform/actions/ActionFormModal';
import { useActionsList, useDeleteAction } from '../../features/platform/actions/hooks';

import styles from './PlatformSetup.module.scss';

import type { Action } from '../../features/platform/actions/types';
import type { ColumnDef } from '@tanstack/react-table';

const PlatformActionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Action | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Action | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = useActionsList();
  const { mutate: deleteAction } = useDeleteAction();

  const allItems = useMemo(() => response?.data ?? [], [response]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allItems;
    return allItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [allItems, debouncedSearch]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: Action) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteAction(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteAction]);

  const columns: ColumnDef<Action>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        cell: ({ row }) => (
          <TableActions
            onEdit={() => handleEdit(row.original)}
            onDelete={() => setDeleteTarget(row.original)}
          />
        ),
      },
    ],
    [handleEdit],
  );

  const showEmptyState = !isLoading && allItems.length === 0 && !debouncedSearch;

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      {showEmptyState ? (
        <NoDataFound
          title="No Actions Yet"
          description="Add permission actions like view, create, update, delete, approve."
          buttonText="Add Action"
          onButtonClick={handleAdd}
          showButtonIcon
        />
      ) : (
        <>
          <PageHeader
            title="Actions"
            subtitle="Permission actions that can be assigned to plan modules and roles."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add Action
              </Button>
            }
          />

          <ListControls
            searchPlaceholder="Search actions..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={false}
            showSort={false}
            showViewSwitcher={false}
            showMultiSelect={false}
          />

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Actions Found"
              description="Try adjusting your search criteria."
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}

      <ActionFormModal open={formOpen} onClose={handleClose} action={editingItem} />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This action will be removed. Any plan or role permissions using it will be affected."
        actionLabel="Delete"
        onAction={handleDeleteConfirm}
      />
    </div>
  );
};

export default PlatformActionsPage;
