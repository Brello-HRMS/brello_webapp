import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import no_department from '../../assets/svg/department/no_department_found.svg';
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
import { DepartmentFormModal } from '../../features/platform/departments/DepartmentFormModal';
import {
  usePlatformDepartmentsList,
  useDeletePlatformDepartment,
} from '../../features/platform/departments/hooks';

import styles from './PlatformSetup.module.scss';

import type { PlatformDepartment } from '../../features/platform/departments/types';
import type { ColumnDef } from '@tanstack/react-table';

const PlatformDepartmentPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlatformDepartment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlatformDepartment | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: response, isLoading } = usePlatformDepartmentsList();
  const { mutate: remove } = useDeletePlatformDepartment();

  const allItems = useMemo(() => response?.data ?? [], [response]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q),
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

  const handleEdit = useCallback((item: PlatformDepartment) => {
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

  const columns: ColumnDef<PlatformDepartment>[] = useMemo(
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
        accessorKey: 'name',
        header: 'Department Name',
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
          title="No Default Departments Yet"
          description="Add default departments that will be automatically copied to every new organization on setup."
          noDataImage={no_department}
          noDataImageAlt="No Departments"
          buttonText="Add Department"
          onButtonClick={handleAdd}
          showButtonIcon
        />
      ) : (
        <>
          <PageHeader
            title="Departments"
            subtitle="Default departments copied to every new organization on setup."
            actions={
              <Button variant="primary" onClick={handleAdd}>
                <Plus size={16} />
                Add department
              </Button>
            }
          />

          <ListControls
            searchPlaceholder="Search department..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showFilters={false}
            showSort={false}
            showViewSwitcher={false}
            showMultiSelect={false}
          />

          {filtered.length === 0 ? (
            <NoDataFound
              title="No Departments Found"
              description="Try adjusting your search criteria."
              noDataImage={no_department}
              noDataImageAlt="No Departments"
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

      <DepartmentFormModal open={formOpen} onClose={handleClose} department={editingItem} />

      <WarningModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This default department will be removed. It will not affect organizations that already have it copied."
        actionLabel="Delete"
        onAction={handleDelete}
      />
    </div>
  );
};

export default PlatformDepartmentPage;
