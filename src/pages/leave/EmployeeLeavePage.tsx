import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Loader2, Palmtree, BriefcaseMedical, CalendarDays, MinusCircle } from 'lucide-react';

import { PageHeader, DataTable, Button, NoDataFound, WarningModal } from '../../components/common';
import noDepartmentImage from '../../assets/svg/department/no_department_found.svg';
import {
  useCancelLeaveRequest,
  useMyLeaveRequests,
  useSubmitLeaveRequest,
} from '../../features/leave/hooks/useLeaveRequest';
import { useMyLeaveBalance } from '../../hooks/useLeaveBalances';
import { employeeLeaveColumns } from '../../features/leave/columns/employeeLeaveColumns';
import { ApplyLeaveModal } from '../../features/leave/components/ApplyLeaveModal/ApplyLeaveModal';

import styles from './EmployeeLeavePage.module.scss';

import type { LeaveRequest } from '../../features/leave/types/leaveRequestTypes';

const getLeaveIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('casual')) return <Palmtree size={20} />;
  if (lower.includes('sick')) return <BriefcaseMedical size={20} />;
  if (lower.includes('earn')) return <CalendarDays size={20} />;
  return <MinusCircle size={20} />;
};

const EmployeeLeavePage: React.FC = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const queryParams = useMemo(
    () => ({ page: pagination.pageIndex + 1, limit: pagination.pageSize }),
    [pagination],
  );

  const { data, isLoading } = useMyLeaveRequests(queryParams);
  const { data: balanceData, isLoading: isBalanceLoading } = useMyLeaveBalance();
  const { mutateAsync: submitRequest } = useSubmitLeaveRequest();
  const { mutateAsync: cancelRequest } = useCancelLeaveRequest();

  const handleAdd = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleSubmitRequest = useCallback(
    async (r: LeaveRequest) => {
      await submitRequest(r.id);
    },
    [submitRequest],
  );

  const handleCancelRequest = useCallback((r: LeaveRequest) => {
    setSelectedRequest(r);
    setShowCancelModal(true);
  }, []);

  const handleDeleteRequest = useCallback((r: LeaveRequest) => {
    setSelectedRequest(r);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (selectedRequest) {
      await cancelRequest({ id: selectedRequest.id, reason: 'Cancelled by employee' });
      setShowCancelModal(false);
      setSelectedRequest(null);
    }
  }, [cancelRequest, selectedRequest]);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedRequest) {
      // In a real app we might have a delete endpoint, but for now we'll just cancel it
      await cancelRequest({ id: selectedRequest.id, reason: 'Deleted draft' });
      setShowDeleteModal(false);
      setSelectedRequest(null);
    }
  }, [cancelRequest, selectedRequest]);

  const columns = useMemo(
    () =>
      employeeLeaveColumns({
        onSubmit: handleSubmitRequest,
        onCancel: handleCancelRequest,
        onDelete: handleDeleteRequest,
      }),
    [handleSubmitRequest, handleCancelRequest, handleDeleteRequest],
  );

  const items = data?.items || [];
  const meta = data?.pagination;
  const pageCount = meta ? Math.ceil(meta.total / meta.limit) : 0;

  const addButton = (
    <Button variant="primary" onClick={handleAdd}>
      <span className={styles.addBtn}>
        <Plus size={16} />
        Apply for Leave
      </span>
    </Button>
  );

  const balances = balanceData?.balances || [];

  if (isLoading || isBalanceLoading) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="My Leave"
          subtitle="Manage your leave requests and balances"
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
        title="My Leave"
        subtitle="Manage your leave requests and balances"
        actions={items.length > 0 ? addButton : undefined}
      />

      {balances.length > 0 && (
        <div className={styles.balanceCards}>
          {balances.map((b) => (
            <div key={b.leave_type_id} className={styles.balanceCard}>
              <div className={styles.cardHeader}>
                <span>{b.leave_type_name}</span>
                {getLeaveIcon(b.leave_type_name)}
              </div>
              <div className={styles.cardBody}>
                <span className={styles.available}>{b.is_unlimited ? '∞' : b.available_days}</span>
                {!b.is_unlimited && <span className={styles.total}>/{b.allocated_days}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <NoDataFound
          title="No Leave Requests Found"
          description="You haven't submitted any leave requests yet."
          buttonText="Apply for Leave"
          onButtonClick={handleAdd}
          noDataImage={noDepartmentImage}
          noDataImageAlt="No leave requests"
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

      <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <WarningModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Request?"
        description="Are you sure you want to cancel this leave request?"
        actionLabel="Cancel Request"
        onAction={handleConfirmCancel}
      />

      <WarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Draft?"
        description="Are you sure you want to delete this draft leave request? This action cannot be undone."
        actionLabel="Delete"
        onAction={handleConfirmDelete}
      />
    </div>
  );
};

export default EmployeeLeavePage;
