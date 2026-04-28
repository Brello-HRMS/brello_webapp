import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { employeePayrollColumns } from '../../features/payroll/columns/employeePayrollColumns';
import { useEmployeeList } from '../../features/payroll/hooks/useEmployeePayroll';
import { ListControls } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';

import styles from './PayrollEmployeesPage.module.scss';

import type { EmployeeWithSalary } from '../../features/payroll/types/payrollConfigTypes';

const PayrollEmployeesPage: React.FC = () => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
    };
  }, [pagination, debouncedSearchQuery]);

  const { employees, isLoading, page } = useEmployeeList(queryParams);

  const handleView = useCallback(
    (emp: EmployeeWithSalary) => navigate(`/payroll/listing/${emp.id}`),
    [navigate],
  );

  const columns = useMemo(() => employeePayrollColumns({ onView: handleView }), [handleView]);

  return (
    <div className={styles.page}>
      <PageHeader title="Payroll List" subtitle="View employees and salary details for payroll." />

      <ListControls
        searchPlaceholder="Search employee by name"
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
          data={employees}
          rowIdField="id"
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={page}
        />
      )}
    </div>
  );
};

export default PayrollEmployeesPage;
