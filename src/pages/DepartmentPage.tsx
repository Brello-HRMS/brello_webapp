import { useEffect, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';

import { DataTable, NoDataFound, PageHeader, Button, ListControls } from '../components/common';
import { DepartmentCard } from '../features/department/components/DepartmentCard/DepartmentCard';
import { departmentColumns } from '../features/department/columns/departmentColumns';
import { useDebounce } from '../hooks/useDebounce';
import { departmentList } from '../features/department/data/departmentData';
import no_department from '../assets/svg/department/no_department_found.svg';

import styles from './DepartmentPage.module.scss';

import type { ViewType, SortOption } from '../components/common';

const sortOptions: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: 'az' },
  { label: 'Alphabetical (Z-A)', value: 'za' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
];

const departmentConfigs: Record<string, { icon: string; bg: string; color: string }> = {
  Engineering: { icon: '', bg: '#f0f5ff', color: '#2b59ff' },
  Marketing: { icon: '', bg: '#ecfdf3', color: '#12b76a' },
  'Human Resource': { icon: '', bg: '#fef6ee', color: '#f79009' },
  Design: { icon: '', bg: '#f9f5ff', color: '#7f56d9' },
  'Customer Success': { icon: '', bg: '#fef2f2', color: '#f04438' },
  Sales: { icon: '', bg: '#fff7ed', color: '#c2410c' },
  Finance: { icon: '', bg: '#fef3f2', color: '#b42318' },
  'Legal Ops': { icon: '', bg: '#eff8ff', color: '#2e90fa' },
};

const DepartmentPage = () => {
  // ... rest of the component
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedSort, setSelectedSort] = useState('az');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredAndSortedData = useMemo(() => {
    let result = [...departmentList];

    // Search logic
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (department) =>
          department.name.toLowerCase().includes(query) ||
          department.email.toLowerCase().includes(query) ||
          department.designation.toLowerCase().includes(query) ||
          department.location.toLowerCase().includes(query) ||
          department.status.toLowerCase().includes(query) ||
          department.type.toLowerCase().includes(query),
      );
    }

    // Sort logic
    result.sort((departmentA, departmentB) => {
      switch (selectedSort) {
        case 'az':
          return departmentA.name.localeCompare(departmentB.name);
        case 'za':
          return departmentB.name.localeCompare(departmentA.name);
        case 'newest':
          // Assuming higher ID or later entry means newer if no date field exists
          return departmentB.id.localeCompare(departmentA.id);
        case 'oldest':
          return departmentA.id.localeCompare(departmentB.id);
        default:
          return 0;
      }
    });

    return result;
  }, [debouncedSearchQuery, selectedSort]);

  useEffect(() => {
    const loadDepartments = async () => {
      setIsLoading(true);

      try {
        // simulate API
        await new Promise((resolve) => setTimeout(resolve, 500));
      } finally {
        setIsLoading(false);
      }
    };

    loadDepartments();
  }, [pagination]);

  const handleAddDepartment = () => {
    // Logic to add department
  };

  if (departmentList.length === 0) {
    return (
      <NoDataFound
        title="No Departments Added Yet"
        description="Set up your first department to structure your organization and keep your workforce efficiently managed and organized."
        noDataImage={no_department}
        noDataImageAlt="No Department Found"
        buttonText="Add New Department"
        showButtonIcon
        onButtonClick={handleAddDepartment}
      />
    );
  }

  return (
    <div
      className={styles.container}
      style={{ opacity: isLoading ? 0.4 : 1, transition: 'opacity 0.2s' }}
    >
      <PageHeader
        title="Departments"
        subtitle="Define and manage company departments."
        actions={
          <>
            <Button variant="secondary">
              <Download size={16} />
              Export
            </Button>
            <Button variant="primary">
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
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        onFilterClick={() => {}}
      />
      {viewType === 'grid' ? (
        <div className={styles.grid}>
          {filteredAndSortedData
            .slice(
              pagination.pageIndex * pagination.pageSize,
              (pagination.pageIndex + 1) * pagination.pageSize,
            )
            .map((item, index) => {
              const names = Object.keys(departmentConfigs);
              const deptName = names[index % names.length];
              const config = departmentConfigs[deptName];

              return (
                <DepartmentCard
                  key={item.id}
                  name={deptName}
                  code={`Code: ${deptName.substring(0, 3).toUpperCase()}-0${index + 1}`}
                  status={index === 2 || index === 7 ? 'Inactive' : 'Active'}
                  icon={config.icon}
                  iconBg={config.bg}
                  iconColor={config.color}
                  members={[
                    'https://i.pravatar.cc/150?u=1',
                    'https://i.pravatar.cc/150?u=2',
                    'https://i.pravatar.cc/150?u=3',
                    'https://i.pravatar.cc/150?u=4',
                    'https://i.pravatar.cc/150?u=5',
                  ]}
                  onActionClick={() => {}}
                />
              );
            })}
        </div>
      ) : (
        <DataTable
          columns={departmentColumns}
          data={filteredAndSortedData}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}
    </div>
  );
};

export default DepartmentPage;
