import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import no_designation from '../../assets/svg/department/no_department_found.svg'; // Reusing the same asset if appropriate
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
import { designationColumns } from '../../features/designation/columns/designationColumns';
import { DesignationCard } from '../../features/designation/components/DesignationCard/DesignationCard';
import { useDeleteDesignation } from '../../features/designation/hooks/useDeleteDesignation';
import { useDesignations } from '../../features/designation/hooks/useDesignations';
import { useUpdateDesignation } from '../../features/designation/hooks/useUpdateDesignation';
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder, Status } from '../../types/common';
import { AddDesignationModal } from '../../features/designation/components/AddDesignationModal/AddDesignationModal';

import styles from './DesignationPage.module.scss';

import type { SortOption, ViewType } from '../../components/common';
import type { Designation } from '../../features/designation/types/designationType';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `title:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `title:${SortOrder.DESC}` },
  { label: 'Newest First', value: `created_at:${SortOrder.DESC}` },
  { label: 'Oldest First', value: `created_at:${SortOrder.ASC}` },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Active', value: Status.ACTIVE },
  { label: 'Inactive', value: Status.INACTIVE },
];

const DesignationPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedSort, setSelectedSort] = useState(`title:${SortOrder.ASC}`);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showCannotDeactivateModal, setShowCannotDeactivateModal] = useState(false);
  const [showDeleteDesigModal, setShowDeleteDesigModal] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [isAddDesignationOpen, setIsAddDesignationOpen] = useState(false);

  // Multi-select state
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Local state for deleted items to hide them immediately
  // const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const { mutate: deleteDesig } = useDeleteDesignation();
  const { mutate: updateDesig } = useUpdateDesignation();

  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    return {
      status: selectedStatus === 'ALL' ? undefined : (selectedStatus as Status),
      search: debouncedSearchQuery || undefined,
    };
  }, [selectedStatus, debouncedSearchQuery]);

  const { data: response, isLoading } = useDesignations(queryParams);

  const designationList = useMemo(() => {
    let data = response?.data || [];

    // Filter out soft-deleted designations that backend might still return
    // data = data.filter((item: any) => !item.deleted_at && !deletedIds.has(item.id));

    // Client-side sorting
    const [sortBy, sortOrder] = selectedSort.split(':');
    data = [...data].sort((a, b) => {
      const fieldA = a[sortBy as keyof Designation];
      const fieldB = b[sortBy as keyof Designation];

      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        const comparison = fieldA.localeCompare(fieldB);
        return sortOrder === SortOrder.ASC ? comparison : -comparison;
      }

      return 0;
    });

    return data;
  }, [response, selectedSort]);

  const totalPages = useMemo(() => {
    const total = designationList.length;
    return Math.ceil(total / pagination.pageSize);
  }, [designationList, pagination.pageSize]);

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return designationList.slice(start, end);
  }, [designationList, pagination.pageIndex, pagination.pageSize]);

  const filteredData = useMemo(() => {
    return paginatedData;
  }, [paginatedData]);

  const handleAddDesignation = useCallback(() => {
    setEditingDesignation(null);
    setIsAddDesignationOpen(true);
  }, []);

  const handleEditDesignation = useCallback((desig: Designation) => {
    setEditingDesignation(desig);
    setIsAddDesignationOpen(true);
  }, []);

  const handleDeactivateClick = useCallback((desig: Designation) => {
    setSelectedDesignation(desig);
    setShowDeactivateModal(true);
  }, []);

  const handleDeleteClick = useCallback((desig: Designation) => {
    setSelectedDesignation(desig);
    setShowDeleteDesigModal(true);
  }, []);

  const handleDeactivate = useCallback(() => {
    if (selectedDesignation) {
      updateDesig(
        {
          id: selectedDesignation.id,
          params: {
            status: selectedDesignation.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE,
          },
        },
        {
          onSuccess: () => setShowDeactivateModal(false),
        },
      );
    }
  }, [selectedDesignation, updateDesig]);

  const handleDeleteDesig = useCallback(() => {
    if (selectedDesignation) {
      deleteDesig(selectedDesignation.id, {
        onSuccess: () => {
          setShowDeleteDesigModal(false);
          setDeletedIds((prev) => new Set(prev).add(selectedDesignation.id));
        },
      });
    }
  }, [selectedDesignation, deleteDesig]);

  const excelExportData = useMemo(() => {
    const dataToExport = isMultiSelectActive
      ? filteredData.filter((desig) => selectedIds[desig.id])
      : filteredData;

    return dataToExport.map((desig) => ({
      Title: desig.title,
      Code: desig.code,
      Description: desig.description,
      Status: desig.status,
    }));
  }, [filteredData, isMultiSelectActive, selectedIds]);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleView = useCallback(
    (desig: Designation) => {
      navigate(`/organisation/designations/${desig.id}`);
    },
    [navigate],
  );

  const renderContent = () => {
    if (viewType === 'grid') {
      if (filteredData.length === 0) {
        return (
          <NoDataFound
            title="No Designations Found"
            description="We couldn't find any designation matching your current search or filter criteria. Try adjusting your filters."
            noDataImage={no_designation}
            noDataImageAlt="No Designation Found"
          />
        );
      }

      return (
        <div className={styles.grid}>
          {paginatedData.map((item) => (
            <DesignationCard
              key={item.id}
              designation={item}
              onEditClick={() => handleEditDesignation(item)}
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
        columns={designationColumns({
          isMultiSelectActive,
          onView: handleView,
          onEdit: handleEditDesignation,
          onDelete: handleDeleteClick,
        })}
        data={paginatedData}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={false}
        pageCount={totalPages}
        enableRowSelection={isMultiSelectActive}
        rowSelection={selectedIds}
        onRowSelectionChange={setSelectedIds}
        rowIdField="id"
      />
    );
  };

  // Main empty state
  if (!isLoading && designationList.length === 0) {
    return (
      <NoDataFound
        title="No Designations Added Yet"
        description="Set up your first designation to structure your organization and keep your workforce efficiently managed and organized."
        noDataImage={no_designation}
        noDataImageAlt="No Designation Found"
        buttonText="Add New Designation"
        onButtonClick={handleAddDesignation}
        showButtonIcon
      />
    );
  }

  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Designations"
        subtitle="Define and manage company designations."
        actions={
          <>
            <ExcelExport
              data={excelExportData}
              filename="designations.xlsx"
              sheetName="Designations"
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
              onClick={handleAddDesignation}
              disabled={isMultiSelectActive}
              title={isMultiSelectActive ? 'Disable multi-select to add designation' : undefined}
            >
              <Plus size={16} />
              Add designation
            </Button>
          </>
        }
      />

      <ListControls
        searchPlaceholder="Search designation..."
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
        title={`${selectedDesignation?.status === Status.ACTIVE ? 'Deactivate' : 'Activate'} ${selectedDesignation?.title} Designation?`}
        description={`Deactivate the ${selectedDesignation?.title} designation? It will no longer be available for new employee assignments.`}
        actionLabel={selectedDesignation?.status === Status.ACTIVE ? 'Deactivate' : 'Activate'}
        onAction={handleDeactivate}
      />

      <AlertModal
        isOpen={showCannotDeactivateModal}
        onClose={() => setShowCannotDeactivateModal(false)}
        title="Cannot Deactivate Designation"
        alertMessage={
          <>
            <strong>Action Blocked:</strong> This designation has active employees assigned.
          </>
        }
        description="Designations with active employees cannot be deactivated or deleted to protect data integrity and payroll accuracy. Reassign all active members to a different designation before you can deactivate the designation."
        actionLabel="View Employees"
        onAction={() => {
          setShowCannotDeactivateModal(false);
          navigate(`/organisation/designations/${selectedDesignation?.id}`);
        }}
      />

      <WarningModal
        isOpen={showDeleteDesigModal}
        onClose={() => setShowDeleteDesigModal(false)}
        title="Delete Designation?"
        description={`Are you sure you want to delete the ${selectedDesignation?.title} designation? This action cannot be undone.`}
        actionLabel="Delete"
        onAction={handleDeleteDesig}
      />

      <AddDesignationModal
        key={isAddDesignationOpen ? selectedDesignation?.id || 'new' : 'closed'}
        open={isAddDesignationOpen}
        onClose={() => {
          setIsAddDesignationOpen(false);
          setEditingDesignation(null);
        }}
        designation={editingDesignation}
      />
    </div>
  );
};

export default DesignationPage;
