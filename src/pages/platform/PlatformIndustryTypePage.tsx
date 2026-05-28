import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import {
  Button,
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  WarningModal,
} from '../../components/common';
import { TableActions } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { IndustryTypeFormModal } from '../../features/platform/industryTypes/IndustryTypeFormModal';
import {
  useIndustryTypesList,
  useDeleteIndustryType,
} from '../../features/platform/industryTypes/hooks';

import styles from './PlatformSetup.module.scss';

import type { IndustryType } from '../../features/platform/industryTypes/types';
import type { ColumnDef } from '@tanstack/react-table';

const PlatformIndustryTypePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IndustryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IndustryType | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = useIndustryTypesList();
  const { mutate: deleteType } = useDeleteIndustryType();

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

  const handleEdit = useCallback((item: IndustryType) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteType(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, deleteType]);

  const columns: ColumnDef<IndustryType>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span style={{ fontWeight: 500 }}>{row.original.name}</span>,
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
          title="No Industry Types Added Yet"
          description="Add your first industry type to get started."
          buttonText="Add Industry Type"
          onButtonClick={handleAdd}
          showButtonIcon
          noDataImage=""
          noDataImageAlt=""
        />
      ) : (
        <>
          <PageHeader
            title="Industry Types"
            subtitle="Manage global industry type master data."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add Industry Type
              </Button>
            }
          />

          <ListControls
            searchPlaceholder="Search industry types..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={false}
            showSort={false}
            showViewSwitcher={false}
            showMultiSelect={false}
          />

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Industry Types Found"
              description="Try adjusting your search criteria."
              noDataImage=""
              noDataImageAlt=""
            />
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </>
      )}

      <IndustryTypeFormModal open={formOpen} onClose={handleClose} industryType={editingItem} />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This industry type will be permanently removed. If it is currently assigned to any organization, deletion will be blocked."
        actionLabel="Delete"
        onAction={handleDeleteConfirm}
      />
    </div>
  );
};

export default PlatformIndustryTypePage;
