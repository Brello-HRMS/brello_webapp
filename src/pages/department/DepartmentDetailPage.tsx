import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';

import {
  Button,
  DataTable,
  ListControls,
  NoDataFound,
  PageHeader,
  WarningModal,
} from '../../components/common';
import { employeeColumns } from '../../features/department/columns/employeeColumns';
import { useDepartments } from '../../features/department/hooks/useDepartments';
import { useEmployees } from '../../features/employee/hooks/useEmployees';
import { useUnmapEmployee } from '../../features/employee/hooks/useUnmapEmployee';
import { AddEmployeeModal } from '../../features/employee/components/AddEmployeeModal/AddEmployeeModal';
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder, Status } from '../../types/common';

import styles from './DepartmentDetailPage.module.scss';

import type { SortOption } from '../../components/common';
import type { Employee } from '../../features/employee/types/employeeType';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `name:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `name:${SortOrder.DESC}` },
];

const DepartmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState(`name:${SortOrder.ASC}`);

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data: response, isLoading: isDepartmentLoading } = useDepartments();
  const department = response?.data?.data?.find((department) => department.id === id);

  const {
    data: usersResponse,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError,
    refetch: refetchEmployees,
  } = useEmployees({ departmentId: id, limit: 1000 });
  const { mutate: unmapUsers } = useUnmapEmployee();

  useEffect(() => {
    if (!isDepartmentLoading && department && department.status === Status.INACTIVE) {
      navigate('/organisation/departments');
    }
  }, [department, isDepartmentLoading, navigate]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredEmployees = useMemo(() => {
    const allUsers: Employee[] = usersResponse?.data?.data || [];

    const query = debouncedSearchQuery.toLowerCase();
    const filtered = !debouncedSearchQuery
      ? allUsers
      : allUsers.filter((emp) => {
          const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
          return (
            fullName.includes(query) ||
            (emp.email || '').toLowerCase().includes(query) ||
            (emp.phone || '').includes(query)
          );
        });

    const [, order] = selectedSort.split(':');
    return [...filtered].sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return order === SortOrder.DESC ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });
  }, [usersResponse, debouncedSearchQuery, selectedSort]);

  return (
    <div className={styles.container}>
      <PageHeader
        title={`${department?.name} Department`}
        titleExtra={<span className={styles.memberCount}>{filteredEmployees.length} Members</span>}
        subtitle={<span className={styles.codeValue}>Code: {department?.code}</span>}
        actions={
          <>
            <Button variant="secondary">
              <Download size={16} />
              Export
            </Button>
            <Button variant="primary" onClick={() => setIsAddEmployeeModalOpen(true)}>
              <Plus size={16} />
              Add employee
            </Button>
          </>
        }
      />

      <ListControls
        searchPlaceholder="Search employee..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewType="table"
        onViewTypeChange={() => {}} // Only table view for now as per design
        sortOptions={SORT_OPTIONS}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        filterOptions={[]}
        selectedFilter=""
        onFilterChange={() => {}}
        filterTitle="Filters"
        showViewSwitcher={false}
        selectedCount={Object.keys(rowSelection).length}
        onDelete={() => setShowDeleteModal(true)}
      />

      {isEmployeesError ? (
        <NoDataFound
          title="Couldn't load employees"
          description="Something went wrong while fetching employees for this department. Please try again."
          buttonText="Retry"
          onButtonClick={() => refetchEmployees()}
          showButtonIcon={false}
        />
      ) : (
        <DataTable
          columns={employeeColumns}
          data={filteredEmployees}
          isLoading={isEmployeesLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          rowIdField="id"
        />
      )}

      <WarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Selected Employees?"
        description={`Are you sure want to unmap the ${Object.keys(rowSelection).length} selected employees from this department?`}
        actionLabel="Remove"
        onAction={() => {
          const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
          if (selectedIds.length === 0) return;

          unmapUsers(
            { userIds: selectedIds, unmapDepartment: true },
            {
              onSuccess: () => {
                setRowSelection({});
                setShowDeleteModal(false);
              },
            },
          );
        }}
      />

      <AddEmployeeModal
        open={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        departmentId={id}
      />
    </div>
  );
};

export default DepartmentDetailPage;
