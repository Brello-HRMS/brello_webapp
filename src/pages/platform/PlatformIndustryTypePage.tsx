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
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder } from '../../types/common';
import { IndustryTypeFormModal } from '../../features/platform/industryTypes/IndustryTypeFormModal';
import {
  useIndustryTypesList,
  useDeleteIndustryType,
} from '../../features/platform/industryTypes/hooks';

import styles from './PlatformSetup.module.scss';

import type { SortOption } from '../../components/common';
import type { IndustryType } from '../../features/platform/industryTypes/types';
import type { ColumnDef } from '@tanstack/react-table';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `name:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `name:${SortOrder.DESC}` },
  { label: 'Newest First', value: `created_at:${SortOrder.DESC}` },
  { label: 'Oldest First', value: `created_at:${SortOrder.ASC}` },
];

const PlatformIndustryTypePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState(`name:${SortOrder.ASC}`);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IndustryType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IndustryType | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = useIndustryTypesList();
  const { mutate: deleteType } = useDeleteIndustryType();

  const allItems = useMemo(() => response?.data ?? [], [response]);

  const filtered = useMemo(() => {
    const [sortBy, sortOrder] = selectedSort.split(':') as [string, SortOrder];
    const q = debouncedSearch.toLowerCase();

    const result = allItems.filter((item) => !q || item.name.toLowerCase().includes(q));

    return [...result].sort((a, b) => {
      const av = sortBy === 'name' ? a.name : a.created_at;
      const bv = sortBy === 'name' ? b.name : b.created_at;
      return sortOrder === SortOrder.ASC ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [allItems, debouncedSearch, selectedSort]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: IndustryType) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteType(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    }
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
        header: '',
        cell: ({ row }) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => handleEdit(row.original)}>
              Edit
            </Button>
            <Button variant="danger" onClick={() => setDeleteTarget(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit],
  );

  if (!isLoading && allItems.length === 0 && !debouncedSearch) {
    return (
      <>
        <NoDataFound
          title="No Industry Types Added Yet"
          description="Add your first industry type to get started."
          buttonText="Add Industry Type"
          onButtonClick={handleAdd}
          showButtonIcon
          noDataImage=""
          noDataImageAlt=""
        />
        <IndustryTypeFormModal
          key={formOpen ? (editingItem?.id ?? 'new') : 'closed'}
          open={formOpen}
          onClose={() => setFormOpen(false)}
          industryType={editingItem}
        />
      </>
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
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
        sortOptions={SORT_OPTIONS}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      <DataTable columns={columns} data={filtered} />

      <IndustryTypeFormModal
        key={formOpen ? (editingItem?.id ?? 'new') : 'closed'}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingItem(null);
        }}
        industryType={editingItem}
      />

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
