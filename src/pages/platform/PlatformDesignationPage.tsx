import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import no_designation from '../../assets/svg/department/no_department_found.svg';
import {
  Button,
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  WarningModal,
} from '../../components/common';
import { StatusBadge, TableActions } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { Status } from '../../types/common';
import { DesignationFormModal } from '../../features/platform/designations/DesignationFormModal';
import {
  usePlatformDesignationsList,
  useDeletePlatformDesignation,
} from '../../features/platform/designations/hooks';

import styles from './PlatformSetup.module.scss';

import type { PlatformDesignation } from '../../features/platform/designations/types';
import type { ColumnDef } from '@tanstack/react-table';

const PlatformDesignationPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlatformDesignation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformDesignation | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = usePlatformDesignationsList();
  const { mutate: remove } = useDeletePlatformDesignation();

  const allItems = useMemo(() => response?.data ?? [], [response]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) => item.title.toLowerCase().includes(q) || item.code.toLowerCase().includes(q),
    );
  }, [allItems, debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / pagination.pageSize);
  const paginated = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: PlatformDesignation) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditingItem(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return;
    remove(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }, [deleteTarget, remove]);

  const columns: ColumnDef<PlatformDesignation>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Code',
        size: 150,
        cell: ({ getValue }) => (
          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Designation Title',
        size: 250,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
        cell: ({ getValue }) => <StatusBadge status={getValue() as Status} />,
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
          title="No Default Designations Yet"
          description="Add default designations that will be automatically copied to every new organization on setup."
          noDataImage={no_designation}
          noDataImageAlt="No Designations"
          buttonText="Add Designation"
          onButtonClick={handleAdd}
          showButtonIcon
        />
      ) : (
        <>
          <PageHeader
            title="Designations"
            subtitle="Default designations copied to every new organization on setup."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add designation
              </Button>
            }
          />

          <ListControls
            searchPlaceholder="Search designation..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={false}
            showSort={false}
            showViewSwitcher={false}
            showMultiSelect={false}
          />

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Designations Found"
              description="Try adjusting your search criteria."
              noDataImage={no_designation}
              noDataImageAlt="No Designations"
            />
          ) : (
            <DataTable
              columns={columns}
              data={paginated}
              pagination={pagination}
              onPaginationChange={setPagination}
              manualPagination={false}
              pageCount={totalPages}
            />
          )}
        </>
      )}

      <DesignationFormModal open={formOpen} onClose={handleClose} designation={editingItem} />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This default designation will be removed. It will not affect organizations that already have it copied."
        actionLabel="Delete"
        onAction={handleDelete}
      />
    </div>
  );
};

export default PlatformDesignationPage;
