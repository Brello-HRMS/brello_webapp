import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';

import { Button, DataTable, ListControls, PageHeader, WarningModal } from '../../components/common';
import { employeeColumns } from '../../features/department/columns/employeeColumns';
import { useDepartments } from '../../features/department/hooks/useDepartments';
import { useUsersList } from '../../features/users/hooks/useUsersList';
import { useUnmapUsers } from '../../features/users/hooks/useUnmapUsers';
import { AddEmployeeModal } from '../../features/users/components/AddEmployeeModal/AddEmployeeModal';
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder, Status } from '../../types/common';

import styles from './DepartmentDetailPage.module.scss';

import type { SortOption } from '../../components/common';
import type { User } from '../../features/users/types/userType';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `name:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `name:${SortOrder.DESC}` },
];

const DepartmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const navigate = useNavigate();

  const { data: response, isLoading: isDepartmentLoading } = useDepartments();
  const department = response?.data?.data?.find((department) => department.id === id);

  const { data: usersResponse } = useUsersList();
  const { mutate: unmapUsers } = useUnmapUsers();

  useEffect(() => {
    if (!isDepartmentLoading && department && department.status === Status.INACTIVE) {
      navigate('/organisation/departments');
    }
  }, [department, isDepartmentLoading, navigate]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredEmployees = useMemo(() => {
    let allUsers: User[] = usersResponse?.data || [];

    // Strict Filtering for this Department Drill
    if (id) {
      allUsers = allUsers.filter((u) => u.departmentId === id);
    }

    if (!debouncedSearchQuery) return allUsers;
    const query = debouncedSearchQuery.toLowerCase();
    return allUsers.filter((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(query) ||
        (emp.email || '').toLowerCase().includes(query) ||
        (emp.phone || '').includes(query)
      );
    });
  }, [usersResponse, debouncedSearchQuery, id]);

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
        selectedSort={`name:${SortOrder.ASC}`}
        onSortChange={() => {}}
        filterOptions={[]}
        selectedFilter=""
        onFilterChange={() => {}}
        filterTitle="Filters"
        showViewSwitcher={false}
        selectedCount={Object.keys(rowSelection).length}
        onDelete={() => setShowDeleteModal(true)}
      />

      <DataTable
        columns={employeeColumns}
        data={filteredEmployees}
        pagination={pagination}
        onPaginationChange={setPagination}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        rowIdField="id"
      />

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
