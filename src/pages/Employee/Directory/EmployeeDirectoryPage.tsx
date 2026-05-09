import { useCallback, useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import no_department from '../../../assets/svg/department/no_department_found.svg';
import {
  Button,
  DataTable,
  ExcelExport,
  ListControls,
  NoDataFound,
  PageHeader,
} from '../../../components/common';
import { employeeColumns } from '../../../features/employee/columns/employeeColumns';
import { EmployeeCard } from '../../../features/employee/components/EmployeeCard/EmployeeCard';
import { AddEmployeeWizard } from '../../../features/employee/components/AddEmployeeWizard/AddEmployeeWizard';
import { WizardProvider } from '../../../features/employee/components/AddEmployeeWizard/WizardContext';
import { getEmployees } from '../../../features/employee/api/employee';
import { useEmployees } from '../../../features/employee/hooks/useEmployees';
import { useDebounce } from '../../../hooks/useDebounce';
import { useModuleAccess } from '../../../hooks/useModuleAccess';
import { ModuleCode } from '../../../enum/modules';
import { SortOrder, Status } from '../../../types/common';
import { showToast } from '../../../features/ToastFeature/ShowToast';

import styles from './EmployeeDirectoryPage.module.scss';

import type { SortOption, ViewType } from '../../../components/common';
import type { Employee } from '../../../features/employee/types/employeeType';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `first_name:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `first_name:${SortOrder.DESC}` },
  { label: 'Newest First', value: `created_at:${SortOrder.DESC}` },
  { label: 'Oldest First', value: `created_at:${SortOrder.ASC}` },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Active', value: Status.ACTIVE },
  { label: 'Inactive', value: Status.INACTIVE },
  { label: 'Pending', value: 'PENDING' },
];

const EmployeeDirectoryPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('table');
  const [selectedSort, setSelectedSort] = useState(`first_name:${SortOrder.ASC}`);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Multi-select state
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);

  const { hasCreateAccess, hasEditAccess, hasDeleteAccess, hasExportAccess } = useModuleAccess(
    ModuleCode.EMP_DIRECTORY,
  );

  const navigate = useNavigate();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    const [sortBy, sortOrder] = selectedSort.split(':');
    return {
      status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      sort_by: sortBy,
      sort_order: sortOrder as SortOrder,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
    };
  }, [selectedSort, selectedStatus, pagination, debouncedSearchQuery]);

  const { data: response, isLoading } = useEmployees(queryParams);

  const employeeList = useMemo(() => response?.data?.data || [], [response]);

  const filteredData = useMemo(() => {
    return employeeList;
  }, [employeeList]);

  const handleAddEmployee = useCallback(() => {
    setIsAddWizardOpen(true);
  }, []);

  const handleEditEmployee = useCallback(
    (emp: Employee) => {
      navigate(`/employee/profile/${emp.id}/edit`);
    },
    [navigate],
  );

  const handleDeleteEmployee = useCallback((emp: Employee) => {
    // Delete action placeholder
    showToast(`Employee not deleted : ${emp.id}`, 'success');
  }, []);

  const handleView = useCallback(
    (emp: Employee) => {
      navigate(`/employee/profile/${emp.id}`);
    },
    [navigate],
  );

  const excelExportData = useMemo(() => {
    if (!isMultiSelectActive) return [];
    const dataToExport = filteredData.filter((emp) => selectedIds[emp.id]);

    return dataToExport.map((emp) => ({
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      Email: emp.email,
      Status: emp.employeeStatus || emp.status,
      Department: emp.department || 'Not Specified',
      Type: emp.type || 'Not Specified',
      Location: emp.location || 'Not Specified',
      Role: emp.role || 'Not Specified',
    }));
  }, [filteredData, isMultiSelectActive, selectedIds]);

  const handleExportData = useCallback(async () => {
    try {
      const [sortBy, sortOrder] = selectedSort.split(':');
      const exportQueryParams = {
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        sort_by: sortBy,
        sort_order: sortOrder as SortOrder,
        limit: 10000, // Large number to fetch all
        page: 1,
        search: debouncedSearchQuery || undefined,
      };

      const response = await getEmployees(exportQueryParams);
      const allData = response.data?.data || [];

      return allData.map((emp: Employee) => ({
        'First Name': emp.firstName,
        'Last Name': emp.lastName,
        Email: emp.email,
        Status: emp.employeeStatus || emp.status,
        Department: emp.department || 'Not Specified',
        Type: emp.type || 'Not Specified',
        Location: emp.location || 'Not Specified',
        Role: emp.role || 'Not Specified',
      }));
    } catch {
      showToast('Failed to fetch data for export', 'error');
      return [];
    }
  }, [selectedSort, selectedStatus, debouncedSearchQuery]);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const renderContent = () => {
    if (viewType === 'grid') {
      if (filteredData.length === 0) {
        return (
          <NoDataFound
            title="No Employees Found"
            description="We couldn't find any employees matching your search or filter criteria."
            noDataImage={no_department}
            noDataImageAlt="No Employees Found"
          />
        );
      }

      return (
        <div className={styles.gridContainer}>
          <div className={styles.grid}>
            {filteredData.map((item) => (
              <EmployeeCard
                key={item.id}
                employee={item}
                onView={() => handleView(item)}
                onEditClick={hasEditAccess ? () => handleEditEmployee(item) : undefined}
                onDelete={hasDeleteAccess ? () => handleDeleteEmployee(item) : undefined}
                isSelecting={isMultiSelectActive}
                isSelected={!!selectedIds[item.id]}
                onSelect={() => handleToggleSelection(item.id)}
              />
            ))}
          </div>

          {(response?.data?.meta?.totalPages || 0) > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Page <strong>{pagination.pageIndex + 1}</strong> of{' '}
                <strong>{response?.data?.meta?.totalPages}</strong>
              </div>
              <div className={styles.paginationControls}>
                <div className={styles.pageNavigation}>
                  <button
                    className={styles.pagiButton}
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
                    disabled={pagination.pageIndex === 0}
                  >
                    <ChevronsLeft size={18} />
                  </button>
                  <button
                    className={styles.pagiButton}
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex - 1 }))}
                    disabled={pagination.pageIndex === 0}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className={styles.pagiButton}
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
                    disabled={pagination.pageIndex >= (response?.data?.meta?.totalPages || 1) - 1}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    className={styles.pagiButton}
                    onClick={() =>
                      setPagination((p) => ({
                        ...p,
                        pageIndex: (response?.data?.meta?.totalPages || 1) - 1,
                      }))
                    }
                    disabled={pagination.pageIndex >= (response?.data?.meta?.totalPages || 1) - 1}
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <DataTable
        columns={employeeColumns({
          isMultiSelectActive,
          onView: handleView,
          onEdit: hasEditAccess ? handleEditEmployee : undefined,
          onDelete: hasDeleteAccess ? handleDeleteEmployee : undefined,
        })}
        data={filteredData}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={true}
        pageCount={response?.data?.meta?.totalPages || 0}
        enableRowSelection={isMultiSelectActive}
        rowSelection={selectedIds}
        onRowSelectionChange={setSelectedIds}
        rowIdField="id"
      />
    );
  };

  // Main empty state
  if (
    !isLoading &&
    employeeList.length === 0 &&
    !debouncedSearchQuery &&
    selectedStatus === 'ALL'
  ) {
    return (
      <>
        <NoDataFound
          title="No Employees Added Yet"
          description="Build out your team by adding your first employee."
          noDataImage={no_department}
          noDataImageAlt="No Employee Found"
          buttonText={hasCreateAccess ? 'Add New Employee' : undefined}
          onButtonClick={hasCreateAccess ? handleAddEmployee : undefined}
          showButtonIcon={hasCreateAccess}
        />
      </>
    );
  }

  return (
    <WizardProvider>
      <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
        <PageHeader
          title="Employee"
          subtitle="View and manage all employee profiles."
          actions={
            <>
              {hasExportAccess && (
                <ExcelExport
                  data={isMultiSelectActive ? excelExportData : undefined}
                  onExportData={!isMultiSelectActive ? handleExportData : undefined}
                  filename="employees.xlsx"
                  sheetName="Employees"
                  buttonText={
                    isMultiSelectActive
                      ? `Export Selected (${Object.values(selectedIds).filter(Boolean).length})`
                      : 'Export All'
                  }
                  variant="secondary"
                  disabled={
                    isMultiSelectActive && Object.values(selectedIds).filter(Boolean).length === 0
                  }
                />
              )}
              {hasCreateAccess && (
                <Button
                  variant="primary"
                  onClick={handleAddEmployee}
                  disabled={isMultiSelectActive}
                  title={isMultiSelectActive ? 'Disable multi-select to add employee' : undefined}
                >
                  <Plus size={16} />
                  Add new employee
                </Button>
              )}
            </>
          }
        />

        <ListControls
          searchPlaceholder="Search employee name or ID..."
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewType={viewType}
          onViewTypeChange={setViewType}
          sortOptions={SORT_OPTIONS}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          filterOptions={STATUS_OPTIONS}
          selectedFilter={selectedStatus}
          onFilterChange={setSelectedStatus}
          filterTitle="Filters"
          showMultiSelect={true}
          isMultiSelectActive={isMultiSelectActive}
          onMultiSelectToggle={() => {
            setIsMultiSelectActive(!isMultiSelectActive);
            if (isMultiSelectActive) {
              setSelectedIds({});
            }
          }}
        />

        {renderContent()}

        <AddEmployeeWizard open={isAddWizardOpen} onClose={() => setIsAddWizardOpen(false)} />
      </div>
    </WizardProvider>
  );
};

export default EmployeeDirectoryPage;
