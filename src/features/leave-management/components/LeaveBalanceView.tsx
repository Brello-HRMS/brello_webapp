import React, { useState, useMemo } from 'react';
import { Search, Eye, Command } from 'lucide-react';

import { DataTable } from '../../../components/common/DataTable/DataTable';
import { Select } from '../../../components/common/Select/Select';
import styles from '../styles/LeaveManagement.module.scss';
import {
  MOCK_EMPLOYEES,
  MOCK_LEAVE_REQUESTS,
  type EmployeeLeaveBalance,
  type LeaveRequest,
} from '../constants/mockData';
import { showToast } from '../../ToastFeature/ShowToast';

import { RequestDetailsModal } from './RequestDetailsModal';

import type { ColumnDef } from '@tanstack/react-table';

export const LeaveBalanceView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [policyFilter, setPolicyFilter] = useState<string | number>('all');
  const [deptFilter, setDeptFilter] = useState<string | number>('all');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 7 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  const departments = useMemo(() => {
    const depts = Array.from(new Set(MOCK_EMPLOYEES.map((e) => e.department)));
    return [
      { label: 'All Departments', value: 'all' },
      ...depts.map((d) => ({ label: d, value: d })),
    ];
  }, []);

  const policies = [
    { label: 'All Policies', value: 'all' },
    { label: 'Casual', value: 'Casual' },
    { label: 'Sick', value: 'Sick' },
    { label: 'Earned', value: 'Earned' },
  ];

  const filteredData = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPolicy = policyFilter === 'all' || emp.policyType === policyFilter;
      const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
      return matchesSearch && matchesPolicy && matchesDept;
    });
  }, [searchTerm, policyFilter, deptFilter]);

  const handleDrill = (emp: EmployeeLeaveBalance) => {
    // Find a request for this employee or create a dummy one for the modal
    const request = MOCK_LEAVE_REQUESTS.find((r) => r.employeeId === emp.id) || {
      ...MOCK_LEAVE_REQUESTS[0],
      employeeId: emp.id,
      employeeName: emp.name,
      avatar: emp.avatar,
      role: emp.role,
      department: emp.department,
      balances: emp.balances,
    };
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const columns: ColumnDef<EmployeeLeaveBalance>[] = [
    {
      header: 'Employee',
      accessorKey: 'name',
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className={styles.employeeCell} onClick={() => handleDrill(emp)}>
            <img src={emp.avatar} alt={emp.name} className={styles.avatar} />
            <div className={styles.info}>
              <span className={styles.name}>{emp.name}</span>
              <span className={styles.id}>ID: {emp.id}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Department',
      accessorKey: 'department',
    },
    {
      header: 'Policy Type',
      accessorKey: 'policyType',
    },
    {
      header: 'Total Balance',
      accessorKey: 'totalBalance',
      cell: ({ row }) => {
        const emp = row.original;
        const percentage = (emp.totalBalance / emp.maxBalance) * 100;
        const isHigh = emp.totalBalance > 15;
        return (
          <div className={styles.balanceCell}>
            <span className={`${styles.value} ${isHigh ? styles.high : styles.low}`}>
              {emp.totalBalance.toFixed(1)} Days
            </span>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progress} ${isHigh ? styles.high : styles.low}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Last Accrual',
      accessorKey: 'lastAccrual',
    },
    {
      header: 'Action',
      id: 'action',
      cell: ({ row }) => (
        <div className={styles.actionCell} onClick={() => handleDrill(row.original)}>
          <Eye size={18} />
        </div>
      ),
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
        </div>
        <div className={styles.rightFilters}>
          <div className={styles.selectWrapper}>
            <Select
              options={policies}
              value={policyFilter}
              onChange={(val) => setPolicyFilter(val)}
              placeholder="All Policies"
            />
          </div>
          <div className={styles.selectWrapper}>
            <Select
              options={departments}
              value={deptFilter}
              onChange={(val) => setDeptFilter(val)}
              placeholder="All Departments"
            />
          </div>
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
        onApprove={() => showToast('Request approved!', 'success')}
        onReject={() => showToast('Request rejected!', 'error')}
      />
    </div>
  );
};
