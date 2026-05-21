import { Search, Eye, Command, X, Check, Filter } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '../../../components/common/Button/Button';
import { DataTable } from '../../../components/common/DataTable/DataTable';
import {
  useLeaveRequests,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
} from '../../../hooks/useLeaveRequests';
import styles from '../styles/LeaveRequestsListView.module.scss';
import { type LeaveRequestItem, LeaveRequestStatus } from '../../../types/leaveRequest';

import { RequestDetailsModal } from './RequestDetailsModal';

import type { ColumnDef } from '@tanstack/react-table';

export const LeaveRequestsListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: response, isLoading } = useLeaveRequests({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm || undefined,
  });

  const { mutate: approveRequest } = useApproveLeaveRequest();
  const { mutate: rejectRequest } = useRejectLeaveRequest();

  const requests = response?.data || [];
  const totalItems = response?.pagination?.total || 0;

  const handleDrill = (id: string) => {
    setSelectedRequestId(id);
    setIsModalOpen(true);
  };

  const handleAction = (id: string, action: 'Approve' | 'Reject') => {
    if (action === 'Approve') {
      approveRequest({ id, comment: 'Approved from list view' });
    } else {
      rejectRequest({ id, rejection_reason: 'Rejected from list view' });
    }
  };

  const columns: ColumnDef<LeaveRequestItem>[] = [
    {
      header: 'Employee',
      accessorKey: 'employee_name',
      cell: ({ row }) => {
        const req = row.original;
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.employee_name)}&background=random`;
        return (
          <div className={styles.employeeCell} onClick={() => handleDrill(req.id)}>
            <img src={avatarUrl} alt={req.employee_name} className={styles.avatar} />
            <div className={styles.info}>
              <span className={styles.name}>{req.employee_name}</span>
              <span className={styles.id}>
                ID: {req.employee_code || req.employee_id.slice(0, 8)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Leave Type',
      accessorKey: 'leave_type_name',
      cell: ({ row }) => {
        const type = row.getValue('leave_type_name') as string;
        let typeClass = styles.casual;
        if (type.toLowerCase().includes('sick')) typeClass = styles.sick;
        if (type.toLowerCase().includes('lop') || type.toLowerCase().includes('without pay'))
          typeClass = styles.lop;
        return <span className={`${styles.typeBadge} ${typeClass}`}>{type}</span>;
      },
    },
    {
      header: 'Date Range',
      id: 'dateRange',
      cell: ({ row }) => {
        const req = row.original;
        const from = new Date(req.from_date).toLocaleDateString();
        const to = new Date(req.to_date).toLocaleDateString();
        return from === to ? from : `${from} - ${to}`;
      },
    },
    {
      header: 'Duration',
      accessorKey: 'total_days',
      cell: ({ row }) => <span className={styles.italicText}>{row.original.total_days} Days</span>,
    },
    {
      header: 'Submitted Time',
      accessorKey: 'submitted_at',
      cell: ({ row }) => {
        const dateStr = row.original.submitted_at;
        return dateStr ? new Date(dateStr).toLocaleString() : 'N/A';
      },
    },
    {
      header: 'Action',
      id: 'action',
      cell: ({ row }) => {
        const req = row.original;
        if (req.status !== LeaveRequestStatus.PENDING) {
          return (
            <span
              className={`${styles.statusBadge} ${req.status === LeaveRequestStatus.APPROVED ? styles.approved : styles.rejected}`}
            >
              {req.status === LeaveRequestStatus.APPROVED ? <Check size={14} /> : <X size={14} />}
              {req.status}
            </span>
          );
        }

        return (
          <div className={styles.actionGroup}>
            <div className={styles.actionIcon} onClick={() => handleDrill(req.id)}>
              <Eye size={18} />
            </div>
            <div className={styles.actionIcon} onClick={() => handleAction(req.id, 'Reject')}>
              <X size={18} />
            </div>
            <div
              className={`${styles.actionIcon} ${styles.approve}`}
              onClick={() => handleAction(req.id, 'Approve')}
            >
              <Check size={18} />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.viewContainer}>
      <div className={styles.filterSection}>
        <div className={styles.leftFilters}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles.commandIcon}>
              <Command size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> /
            </div>
          </div>
          <Button variant="outline" className={styles.filterBtn}>
            <Filter size={16} />
            Filters
          </Button>
        </div>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading leave requests...</div>
        ) : (
          <DataTable
            columns={columns}
            data={requests}
            pagination={pagination}
            onPaginationChange={setPagination}
            manualPagination={true}
            pageCount={Math.ceil(totalItems / pagination.pageSize)}
          />
        )}
      </div>

      <RequestDetailsModal
        key={selectedRequestId || 'none'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequestId(null);
        }}
        requestId={selectedRequestId}
      />
    </div>
  );
};
