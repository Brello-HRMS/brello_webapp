import React, { useState } from 'react';
import { Search, Eye, Command, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import { DataTable } from '../../../components/common/DataTable/DataTable';
import { Select } from '../../../components/common/Select/Select';
import styles from '../styles/LeaveBalanceView.module.scss';
import { useLeaveBalances } from '../../../hooks/useLeaveBalances';
import { useDepartments } from '../../department/hooks/useDepartments';
import { usePolicyTypes } from '../../policies/hooks/usePolicyTypes';

import { EmployeeBalanceModal } from './EmployeeBalanceModal';

import type { ColumnDef } from '@tanstack/react-table';
import type { ListBalanceItem } from '../../../api/leaveBalances';

export const LeaveBalanceView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [policyFilter, setPolicyFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sort, setSort] = useState<{ sortBy: string; sortOrder: 'ASC' | 'DESC' }>({
    sortBy: 'employee_name',
    sortOrder: 'ASC',
  });

  const [selectedEmployee, setSelectedEmployee] = useState<ListBalanceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const { data: balanceResponse, isLoading } = useLeaveBalances({
    leave_year: currentYear,
    department_id: deptFilter === 'all' ? undefined : deptFilter,
    sort_by: sort.sortBy,
    sort_order: sort.sortOrder,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm || undefined,
  });

  const { data: departmentsRes } = useDepartments();
  const { data: policyTypes = [] } = usePolicyTypes();

  const deptOptions = [
    { label: 'All Departments', value: 'all' },
    ...(departmentsRes?.data?.data?.map((d) => ({ label: d.name, value: d.id })) || []),
  ];

  const policyOptions = [
    { label: 'All Policies', value: 'all' },
    ...(policyTypes?.map((pt) => ({ label: pt.name, value: pt.id })) || []),
  ];

  const handleSort = (column: string) => {
    setSort((prev) => ({
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  const renderSortIcon = (column: string) => {
    if (sort.sortBy !== column) return <ArrowUpDown size={14} opacity={0.3} />;
    return sort.sortOrder === 'ASC' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const totalItems = balanceResponse?.pagination?.total || 0;
  const pageCount = Math.ceil(totalItems / pagination.pageSize);

  const data = balanceResponse?.data || [];

  const columns: ColumnDef<ListBalanceItem>[] = [
    {
      header: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('employee_name')}>
          Employee {renderSortIcon('employee_name')}
        </div>
      ),
      accessorKey: 'employee_name',
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className={styles.employeeCell}>
            <img
              src={
                item.employee_avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(item.employee_name)}&background=random`
              }
              alt={item.employee_name}
              className={styles.avatar}
            />
            <div className={styles.info}>
              <span className={styles.name}>{item.employee_name}</span>
              <span className={styles.id}>
                ID: {item.employee_code || item.employee_id.slice(0, 8)}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('department_name')}>
          Department {renderSortIcon('department_name')}
        </div>
      ),
      accessorKey: 'department_name',
      cell: ({ row }) => row.original.department_name || 'N/A',
    },
    {
      header: () => (
        <div className={styles.sortableHeader} onClick={() => handleSort('total_available')}>
          Available Balance {renderSortIcon('total_available')}
        </div>
      ),
      accessorKey: 'total_available',
      cell: ({ row }) => {
        const item = row.original;
        const available = item.total_available;
        const allocated = item.total_allocated || 1;
        const percentage = (available / allocated) * 100;
        const isHigh = available > 15;

        return (
          <div className={styles.balanceCell}>
            <span className={`${styles.value} ${isHigh ? styles.high : styles.low}`}>
              {`${available.toFixed(1)} / ${item.total_allocated.toFixed(1)}`}
            </span>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progress} ${isHigh ? styles.high : styles.low}`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
          </div>
        );
      },
    },

    {
      header: 'Action',
      id: 'action',
      cell: ({ row }) => (
        <div
          className={styles.actionCell}
          onClick={() => {
            setSelectedEmployee(row.original);
            setIsModalOpen(true);
          }}
        >
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
              options={policyOptions}
              value={policyFilter}
              onChange={(val) => setPolicyFilter(String(val))}
              placeholder="All Policies"
            />
          </div>
          <div className={styles.selectWrapper}>
            <Select
              options={deptOptions}
              value={deptFilter}
              onChange={(val) => setDeptFilter(String(val))}
              placeholder="All Departments"
            />
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading balances...</div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            pagination={pagination}
            onPaginationChange={setPagination}
            manualPagination={true}
            pageCount={pageCount}
          />
        )}
      </div>

      <EmployeeBalanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
};
