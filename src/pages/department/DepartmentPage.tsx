import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import no_department from '../../assets/svg/department/no_department_found.svg';
import {
  Button,
  DataTable,
  ExcelExport,
  ListControls,
  NoDataFound,
  PageHeader,
  WarningModal,
  AlertModal,
} from '../../components/common';
import { departmentColumns } from '../../features/department/columns/departmentColumns';
import { DepartmentCard } from '../../features/department/components/DepartmentCard/DepartmentCard';
import { useDeleteDepartment } from '../../features/department/hooks/useDeleteDepartment';
import { useDepartments } from '../../features/department/hooks/useDepartments';
import { useUpdateDepartment } from '../../features/department/hooks/useUpdateDepartment';
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder, Status } from '../../types/common';
import { AddDepartmentModal } from '../../features/department/components/AddDepartmentModal/AddDepartmentModal';

import styles from './DepartmentPage.module.scss';

import type { SortOption, ViewType } from '../../components/common';
import type { Department } from '../../features/department/types/departmentType';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `name:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `name:${SortOrder.DESC}` },
  { label: 'Newest First', value: `created_at:${SortOrder.DESC}` },
  { label: 'Oldest First', value: `created_at:${SortOrder.ASC}` },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Active', value: Status.ACTIVE },
  { label: 'Inactive', value: Status.INACTIVE },
];

const DepartmentPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedSort, setSelectedSort] = useState(`name:${SortOrder.ASC}`);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showCannotDeactivateModal, setShowCannotDeactivateModal] = useState(false);
  const [showDeleteDeptModal, setShowDeleteDeptModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);

  // Multi-select state
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const { mutate: deleteDept } = useDeleteDepartment();
  const { mutate: updateDept } = useUpdateDepartment();

  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    const [sortBy, sortOrder] = selectedSort.split(':');
    return {
      status: selectedStatus === 'ALL' ? undefined : (selectedStatus as Status),
      sort_by: sortBy,
      sort_order: sortOrder as SortOrder,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
    };
  }, [selectedSort, selectedStatus, pagination, debouncedSearchQuery]);

  const { data: response, isLoading } = useDepartments(queryParams);

  const departmentList = useMemo(() => response?.data?.data || [], [response]);

  const filteredData = useMemo(() => {
    return departmentList;
  }, [departmentList]);

  const handleAddDepartment = useCallback(() => {
    setEditingDepartment(null);
    setIsAddDepartmentOpen(true);
  }, []);

  const handleEditDepartment = useCallback((dept: Department) => {
    setEditingDepartment(dept);
    setIsAddDepartmentOpen(true);
  }, []);

  const handleDeactivateClick = useCallback((dept: Department) => {
    setSelectedDepartment(dept);
    if (dept.memberAvatars?.length > 0) {
      setShowCannotDeactivateModal(true);
    } else {
      setShowDeactivateModal(true);
    }
  }, []);

  const handleDeleteClick = useCallback((dept: Department) => {
    setSelectedDepartment(dept);
    setShowDeleteDeptModal(true);
  }, []);

  const handleDeactivate = useCallback(() => {
    if (selectedDepartment) {
      updateDept(
        {
          id: selectedDepartment.id,
          params: {
            status: selectedDepartment.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE,
          },
        },
        {
          onSuccess: () => setShowDeactivateModal(false),
        },
      );
    }
  }, [selectedDepartment, updateDept]);

  const handleDeleteDept = useCallback(() => {
    if (selectedDepartment) {
      deleteDept(selectedDepartment.id, {
        onSuccess: () => setShowDeleteDeptModal(false),
      });
    }
  }, [selectedDepartment, deleteDept]);

  const excelExportData = useMemo(() => {
    const dataToExport = isMultiSelectActive
      ? filteredData.filter((dept) => selectedIds[dept.id])
      : filteredData;

    return dataToExport.map((dept) => ({
      Name: dept.name,
      Code: dept.code,
      Description: dept.description,
      Status: dept.status,
    }));
  }, [filteredData, isMultiSelectActive, selectedIds]);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleView = useCallback(
    (dept: Department) => {
      navigate(`/organisation/departments/${dept.id}`);
    },
    [navigate],
  );

  const renderContent = () => {
    if (viewType === 'grid') {
      if (filteredData.length === 0) {
        return (
          <NoDataFound
            title="No Departments Found"
            description="We couldn't find any department matching your current search or filter criteria. Try adjusting your filters."
            noDataImage={no_department}
            noDataImageAlt="No Department Found"
          />
        );
      }

      return (
        <div className={styles.grid}>
          {departmentList.map((item) => (
            <DepartmentCard
              key={item.id}
              department={item}
              onEditClick={() => handleEditDepartment(item)}
              onToggleStatus={() => handleDeactivateClick(item)}
              onDelete={() => handleDeleteClick(item)}
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
        columns={departmentColumns({
          isMultiSelectActive,
          onView: handleView,
          onEdit: handleEditDepartment,
          onDelete: handleDeleteClick,
        })}
        data={departmentList}
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
  if (!isLoading && departmentList.length === 0) {
    return (
      <NoDataFound
        title="No Departments Added Yet"
        description="Set up your first department to structure your organization and keep your workforce efficiently managed and organized."
        noDataImage={no_department}
        noDataImageAlt="No Department Found"
        buttonText="Add New Department"
        onButtonClick={handleAddDepartment}
        showButtonIcon
      />
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Departments"
        subtitle="Define and manage company departments."
        actions={
          <>
            <ExcelExport
              data={excelExportData}
              filename="departments.xlsx"
              sheetName="Departments"
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
            <Button
              variant="primary"
              onClick={handleAddDepartment}
              disabled={isMultiSelectActive}
              title={isMultiSelectActive ? 'Disable multi-select to add department' : undefined}
            >
              <Plus size={16} />
              Add department
            </Button>
          </>
        }
      />

      <ListControls
        searchPlaceholder="Search department..."
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
        filterTitle="Filter"
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

      <WarningModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title={`${selectedDepartment?.status === Status.ACTIVE ? 'Deactivate' : 'Activate'} ${selectedDepartment?.name} Department?`}
        description={`Deactivate the ${selectedDepartment?.name} department? It will no longer be available for new employee assignments.`}
        actionLabel={selectedDepartment?.status === Status.ACTIVE ? 'Deactivate' : 'Activate'}
        onAction={handleDeactivate}
      />

      <AlertModal
        isOpen={showCannotDeactivateModal}
        onClose={() => setShowCannotDeactivateModal(false)}
        title="Cannot Deactivate Department"
        alertMessage={
          <>
            <strong>Action Blocked:</strong> {selectedDepartment?.memberAvatars?.length} active
            employees assigned.
          </>
        }
        description="Departments with active employees cannot be deactivated or deleted to protect data integrity and payroll accuracy. Reassign all active members to a different department before you can deactivate the department."
        actionLabel="View Employees"
        onAction={() => {
          setShowCannotDeactivateModal(false);
          navigate(`/organisation/departments/${selectedDepartment?.id}`);
        }}
      />

      <WarningModal
        isOpen={showDeleteDeptModal}
        onClose={() => setShowDeleteDeptModal(false)}
        title="Delete Department?"
        description={`Are you sure you want to delete the ${selectedDepartment?.name} department? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleDeleteDept}
      />

      <AddDepartmentModal
        key={isAddDepartmentOpen ? editingDepartment?.id || 'new' : 'closed'}
        open={isAddDepartmentOpen}
        onClose={() => {
          setIsAddDepartmentOpen(false);
          setEditingDepartment(null);
        }}
        department={editingDepartment}
      />
    </div>
  );
};

export default DepartmentPage;
