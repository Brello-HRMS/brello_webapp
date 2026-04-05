import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
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
    navigate('/employee/new');
  }, [navigate]);

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
    const dataToExport = isMultiSelectActive
      ? filteredData.filter((emp) => selectedIds[emp.id])
      : filteredData;

    return dataToExport.map((emp) => ({
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      Email: emp.email,
      Status: emp.status,
      Department: emp.department || 'Not Specified',
      Type: emp.type || 'Not Specified',
      Location: emp.location || 'Not Specified',
      Role: emp.role || 'Not Specified',
    }));
  }, [filteredData, isMultiSelectActive, selectedIds]);

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
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Employee"
        subtitle="View and manage all employee profiles."
        actions={
          <>
            {hasExportAccess && (
              <ExcelExport
                data={excelExportData}
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
    </div>
  );
};

export default EmployeeDirectoryPage;
