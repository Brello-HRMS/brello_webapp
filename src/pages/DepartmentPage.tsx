import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import no_department from '../assets/svg/department/no_department_found.svg';
import {
  Button,
  DataTable,
  ExcelExport,
  ListControls,
  NoDataFound,
  PageHeader,
} from '../components/common';
import { departmentColumns } from '../features/department/columns/departmentColumns';
import { DepartmentCard } from '../features/department/components/DepartmentCard/DepartmentCard';
import { useDepartments } from '../features/department/hooks/useDepartments';
import { useDebounce } from '../hooks/useDebounce';
import { SortOrder, Status } from '../types/common';

import styles from './DepartmentPage.module.scss';

import type { SortOption, ViewType } from '../components/common';

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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    const [sortBy, sortOrder] = selectedSort.split(':');
    return {
      status: selectedStatus === 'ALL' ? undefined : (selectedStatus as Status),
      sort_by: sortBy,
      sort_order: sortOrder as SortOrder,
    };
  }, [selectedSort, selectedStatus]);

  const { data: response, isLoading } = useDepartments(queryParams);

  const departmentList = useMemo(() => response?.data || [], [response]);

  const filteredData = useMemo(() => {
    if (!debouncedSearchQuery) return departmentList;
    const query = debouncedSearchQuery.toLowerCase();
    return departmentList.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        dept.code.toLowerCase().includes(query) ||
        dept.description.toLowerCase().includes(query),
    );
  }, [debouncedSearchQuery, departmentList]);

  const handleAddDepartment = useCallback(() => {
    // Logic to add department
  }, []);

  const handleEditClick = useCallback(() => {
    // Logic for action click
  }, []);

  const excelExportData = useMemo(() => {
    return filteredData.map((dept) => ({
      Name: dept.name,
      Code: dept.code,
      Description: dept.description,
      Status: dept.status,
    }));
  }, [filteredData]);

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
          {filteredData
            .slice(
              pagination.pageIndex * pagination.pageSize,
              (pagination.pageIndex + 1) * pagination.pageSize,
            )
            .map((item) => (
              <DepartmentCard key={item.id} department={item} onEditClick={handleEditClick} />
            ))}
        </div>
      );
    }

    return (
      <DataTable
        columns={departmentColumns}
        data={filteredData}
        pagination={pagination}
        onPaginationChange={setPagination}
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
              buttonText="Export"
              variant="secondary"
            />
            <Button variant="primary" onClick={handleAddDepartment}>
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
      />

      {renderContent()}
    </div>
  );
};

export default DepartmentPage;
