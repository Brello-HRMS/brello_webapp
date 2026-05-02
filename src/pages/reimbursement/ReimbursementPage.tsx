import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { ListControls } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { useAllReimbursements } from '../../features/reimbursement/hooks/useAdminReimbursement';
import { adminReimbursementColumns } from '../../features/reimbursement/columns/adminReimbursementColumns';
import { EditReimbursementDrawer } from '../../features/reimbursement/components/EditReimbursementDrawer/EditReimbursementDrawer';

import styles from './ReimbursementPage.module.scss';

import type { Reimbursement } from '../../features/reimbursement/types/reimbursementTypes';

const ReimbursementPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReimbursement, setSelectedReimbursement] = useState<Reimbursement | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const queryParams = useMemo(
    () => ({ page: pagination.pageIndex + 1, limit: pagination.pageSize }),
    [pagination],
  );

  const { items, isLoading, pagination: meta } = useAllReimbursements(queryParams);

  const filteredItems = useMemo(() => {
    if (!debouncedSearch) return items;
    const lower = debouncedSearch.toLowerCase();
    return items.filter(
      (r) =>
        r.employee?.name?.toLowerCase().includes(lower) ||
        r.employee?.employee_code?.toLowerCase().includes(lower) ||
        r.title.toLowerCase().includes(lower),
    );
  }, [items, debouncedSearch]);

  const handleEdit = useCallback((r: Reimbursement) => setSelectedReimbursement(r), []);
  const handleCloseDrawer = useCallback(() => setSelectedReimbursement(null), []);

  const columns = useMemo(() => adminReimbursementColumns({ onEdit: handleEdit }), [handleEdit]);

  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  return (
    <div className={styles.page}>
      <PageHeader
        title="All Reimbursements"
        subtitle="Manage and audit company-wide expense requests with precision."
      />

      <ListControls
        searchPlaceholder="Search employee name or ID..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={false}
        showSort={false}
        showViewSwitcher={false}
      />

      {isLoading ? (
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={28} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredItems}
          rowIdField="id"
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={pageCount}
          manualPagination
        />
      )}

      <EditReimbursementDrawer reimbursement={selectedReimbursement} onClose={handleCloseDrawer} />
    </div>
  );
};

export default ReimbursementPage;
