import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';

import { PageHeader, DataTable, Button, NoDataFound, WarningModal } from '../../components/common';
import {
  useMyReimbursements,
  useDeleteReimbursement,
} from '../../features/reimbursement/hooks/useReimbursement';
import { employeeReimbursementColumns } from '../../features/reimbursement/columns/employeeReimbursementColumns';
import { AddReimbursementModal } from '../../features/reimbursement/components/AddReimbursementModal/AddReimbursementModal';
import noDepartmentImage from '../../assets/svg/department/no_department_found.svg';

import styles from './EmployeeReimbursementPage.module.scss';

import type { Reimbursement } from '../../features/reimbursement/types/reimbursementTypes';

const EmployeeReimbursementPage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReimbursement, setEditingReimbursement] = useState<Reimbursement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState<Reimbursement | null>(null);

  const queryParams = useMemo(
    () => ({ page: pagination.pageIndex + 1, limit: pagination.pageSize }),
    [pagination],
  );

  const { items, isLoading, pagination: meta } = useMyReimbursements(queryParams);
  const { deleteReimbursement } = useDeleteReimbursement();

  const handleAdd = useCallback(() => {
    setEditingReimbursement(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((r: Reimbursement) => {
    setEditingReimbursement(r);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((r: Reimbursement) => {
    setSelectedReimbursement(r);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedReimbursement) {
      await deleteReimbursement(selectedReimbursement.id);
      setShowDeleteModal(false);
      setSelectedReimbursement(null);
    }
  }, [deleteReimbursement, selectedReimbursement]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingReimbursement(null);
  }, []);

  const columns = useMemo(
    () => employeeReimbursementColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete],
  );

  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const addButton = (
    <Button variant="primary" onClick={handleAdd}>
      <span className={styles.addBtn}>
        <Plus size={16} />
        Add reimbursement
      </span>
    </Button>
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Reimbursements"
          subtitle="Submit and track your expense requests"
          actions={addButton}
        />
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Reimbursements"
        subtitle="Submit and track your expense requests"
        actions={items.length > 0 ? addButton : undefined}
      />

      {items.length === 0 ? (
        <NoDataFound
          title="No Reimbursements Added Yet"
          description="You haven't submitted any reimbursement requests. Add one to track your expenses."
          buttonText="Add reimbursement"
          onButtonClick={handleAdd}
          noDataImage={noDepartmentImage}
          noDataImageAlt="No reimbursements"
        />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          rowIdField="id"
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={pageCount}
          manualPagination
        />
      )}

      <AddReimbursementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingReimbursement={editingReimbursement}
      />

      <WarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Reimbursement?"
        description={`Are you sure you want to delete the reimbursement "${selectedReimbursement?.title}"? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleConfirmDelete}
      />
    </div>
  );
};

export default EmployeeReimbursementPage;
