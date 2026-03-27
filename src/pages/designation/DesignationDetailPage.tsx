import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';

import { Button, DataTable, ListControls, PageHeader, WarningModal } from '../../components/common';
import { employeeColumns } from '../../features/department/columns/employeeColumns';
import { DUMMY_EMPLOYEES } from '../../features/department/data/dummyEmployees';
import { useDesignations } from '../../features/designation/hooks/useDesignations';
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder, Status } from '../../types/common';

import styles from './DesignationDetailPage.module.scss';

import type { SortOption } from '../../components/common';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `title:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `title:${SortOrder.DESC}` },
];

const DesignationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Fetch the specific designation details
  const { data: response, isLoading } = useDesignations();
  const designation = response?.data?.find((desig) => desig.id === id);

  useEffect(() => {
    if (!isLoading && designation && designation.status === Status.INACTIVE) {
      navigate('/organisation/designations');
    }
  }, [designation, isLoading, navigate]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredEmployees = useMemo(() => {
    // Note: In a real app, we'd filter by designation ID
    if (!debouncedSearchQuery) return DUMMY_EMPLOYEES;
    const query = debouncedSearchQuery.toLowerCase();
    return DUMMY_EMPLOYEES.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeId.toLowerCase().includes(query) ||
        emp.designation.toLowerCase().includes(query),
    );
  }, [debouncedSearchQuery]);

  return (
    <div className={styles.container}>
      <PageHeader
        title={`${designation?.title} Designation`}
        titleExtra={<span className={styles.memberCount}>{filteredEmployees.length} Members</span>}
        subtitle={<span className={styles.codeValue}>Code: {designation?.code}</span>}
        actions={
          <>
            <Button variant="secondary">
              <Download size={16} />
              Export
            </Button>
            <Button variant="primary">
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
        selectedSort={`title:${SortOrder.ASC}`}
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
        rowIdField="employeeId"
      />

      <WarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Selected Employees?"
        description={`Are you sure want to delete the ${Object.keys(rowSelection).length} selected employees? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={() => {
          // API Logic
          setRowSelection({});
          setShowDeleteModal(false);
        }}
      />
    </div>
  );
};

export default DesignationDetailPage;
