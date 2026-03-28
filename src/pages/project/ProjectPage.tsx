import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import no_project from '../../assets/svg/department/no_department_found.svg';
import {
  DataTable,
  ExcelExport,
  ListControls,
  NoDataFound,
  PageHeader,
} from '../../components/common';
import { useAllProjects } from '../../features/project/hooks/useAllProjects';
import { useDebounce } from '../../hooks/useDebounce';
import { SortOrder } from '../../types/common';
import { ProjectStatus } from '../../features/project/types/projectType';
import { allProjectColumns } from '../../features/project/columns/allProjectsColumns';

import styles from './ProjectPage.module.scss';

import type { SortOption, ViewType } from '../../components/common';
import type { Project } from '../../features/project/types/projectType';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: `name:${SortOrder.ASC}` },
  { label: 'Alphabetical (Z-A)', value: `name:${SortOrder.DESC}` },
  { label: 'Newest First', value: `created_at:${SortOrder.DESC}` },
  { label: 'Oldest First', value: `created_at:${SortOrder.ASC}` },
];

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Draft', value: ProjectStatus.DRAFT },
  { label: 'Active', value: ProjectStatus.ACTIVE },
  { label: 'On Hold', value: ProjectStatus.ON_HOLD },
  { label: 'Completed', value: ProjectStatus.COMPLETED },
];

const ProjectPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('table');
  const [selectedSort, setSelectedSort] = useState(`name:${SortOrder.ASC}`);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Multi-select state
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => {
    const [sortBy, sortOrder] = selectedSort.split(':');
    return {
      project_status: selectedStatus === 'ALL' ? undefined : (selectedStatus as ProjectStatus),
      sort_by: sortBy,
      sort_order: sortOrder as SortOrder,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
    };
  }, [selectedSort, selectedStatus, pagination, debouncedSearchQuery]);

  const { data: response, isLoading } = useAllProjects(queryParams);

  const projectList = useMemo(() => response?.data?.data || [], [response]);

  const excelExportData = useMemo(() => {
    const dataToExport = isMultiSelectActive
      ? projectList.filter((project) => selectedIds[project.id])
      : projectList;

    return dataToExport.map((project) => ({
      Name: project.name,
      Client: project.client?.name || '-',
      Type: project.project_type,
      Status: project.project_status,
      Priority: project.priority,
      'Start Date': project.start_date,
      'End Date': project.end_date,
    }));
  }, [projectList, isMultiSelectActive, selectedIds]);

  const handleView = useCallback(
    (project: Project) => {
      navigate(`/project/clients/${project.client_id}/projects/${project.id}`);
    },
    [navigate],
  );

  // Main empty state
  if (!isLoading && projectList.length === 0 && !debouncedSearchQuery && selectedStatus === 'ALL') {
    return (
      <NoDataFound
        title="No Projects Added Yet"
        description="Projects will appear here once they are created under clients."
        noDataImage={no_project}
        noDataImageAlt="No Project Found"
      />
    );
  }

  return (
    <div className={` ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="Project Management"
        subtitle="List of all projects under the organization."
        actions={
          <>
            <ExcelExport
              data={excelExportData}
              filename="projects.xlsx"
              sheetName="Projects"
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
          </>
        }
      />

      <ListControls
        searchPlaceholder="Search project..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewType={viewType}
        showViewSwitcher={false}
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

      <DataTable
        columns={allProjectColumns({
          onView: handleView,
        })}
        data={projectList}
        pagination={pagination}
        onPaginationChange={setPagination}
        manualPagination={true}
        pageCount={response?.data?.meta?.totalPages || 0}
        enableRowSelection={isMultiSelectActive}
        rowSelection={selectedIds}
        onRowSelectionChange={setSelectedIds}
        rowIdField="id"
      />
    </div>
  );
};

export default ProjectPage;
