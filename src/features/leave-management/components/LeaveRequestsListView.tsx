import React, { useState, useMemo } from 'react';
import { Search, Eye, Command, X, Check, Filter } from 'lucide-react';

import { DataTable } from '../../../components/common/DataTable/DataTable';
import { Button } from '../../../components/common/Button/Button';
import styles from '../styles/LeaveManagement.module.scss';
import { MOCK_LEAVE_REQUESTS, type LeaveRequest } from '../constants/mockData';
import { showToast } from '../../ToastFeature/ShowToast';

import { RequestDetailsModal } from './RequestDetailsModal';

import type { ColumnDef } from '@tanstack/react-table';

export const LeaveRequestsListView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 7 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const filteredData = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, requests]);

  const handleDrill = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    showToast(
      `Request ${status.toLowerCase()} successfully!`,
      status === 'Approved' ? 'success' : 'error',
    );
  };

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      header: 'Employee',
      accessorKey: 'employeeName',
      cell: ({ row }) => {
        const req = row.original;
        return (
          <div className={styles.employeeCell} onClick={() => handleDrill(req)}>
            <img src={req.avatar} alt={req.employeeName} className={styles.avatar} />
            <div className={styles.info}>
              <span className={styles.name}>{req.employeeName}</span>
              <span className={styles.id}>ID: {req.employeeId}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Leave Type',
      accessorKey: 'leaveType',
      cell: ({ row }) => {
        const type = row.getValue('leaveType') as string;
        let typeClass = styles.casual;
        if (type === 'Sick') typeClass = styles.sick;
        if (type === 'LOP') typeClass = styles.lop;
        return <span className={`${styles.typeBadge} ${typeClass}`}>{type}</span>;
      },
    },
    {
      header: 'Date Range',
      accessorKey: 'dateRange',
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      cell: ({ row }) => <span className={styles.italicText}>{row.getValue('duration')}</span>,
    },
    {
      header: 'Submitted Time',
      accessorKey: 'submittedTime',
    },
    {
      header: 'Action',
      id: 'action',
      cell: ({ row }) => {
        const req = row.original;
        if (req.status !== 'Pending') {
          return (
            <span
              className={`${styles.statusBadge} ${req.status === 'Approved' ? styles.approved : styles.rejected}`}
            >
              {req.status === 'Approved' ? <Check size={14} /> : <X size={14} />}
              {req.status}
            </span>
          );
        }
        return (
          <div className={styles.actionGroup}>
            <div className={styles.actionIcon} onClick={() => handleDrill(req)}>
              <Eye size={18} />
            </div>
            <div className={styles.actionIcon} onClick={() => handleAction(req.id, 'Rejected')}>
              <X size={18} />
            </div>
            <div
              className={`${styles.actionIcon} ${styles.approve}`}
              onClick={() => handleAction(req.id, 'Approved')}
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
        <DataTable
          columns={columns}
          data={filteredData}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={false}
        />
      </div>

      <RequestDetailsModal
        key={selectedRequest?.id || 'none'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        // onApprove={(id) => handleAction(id, 'Approved')}
        // onReject={(id) => handleAction(id, 'Rejected')}
      />
    </div>
  );
};
