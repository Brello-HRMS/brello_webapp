import { useEffect, useState } from 'react';
import {
  Banknote,
  Code2,
  Download,
  FileText,
  Headset,
  Palette,
  Plus,
  Tv,
  Users,
  Wallet,
} from 'lucide-react';

import { DataTable, NoDataFound, PageHeader, Button, ListControls } from '../components/common';
import { DepartmentCard } from '../features/department/components/DepartmentCard/DepartmentCard';
import { departmentColumns } from '../features/department/columns/departmentColumns';
import { departmentList } from '../features/department/data/departmentData';
import no_department from '../assets/svg/department/no_department_found.svg';

import styles from './DepartmentPage.module.scss';

import type { LucideIcon } from 'lucide-react';
import type { ViewType, SortOption } from '../components/common';

const sortOptions: SortOption[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Alphabetical (A-Z)', value: 'az' },
  { label: 'Alphabetical (Z-A)', value: 'za' },
];

const departmentConfigs: Record<string, { icon: LucideIcon; bg: string; color: string }> = {
  Engineering: { icon: Code2, bg: '#f0f5ff', color: '#2b59ff' },
  Marketing: { icon: Tv, bg: '#ecfdf3', color: '#12b76a' },
  'Human Resource': { icon: Users, bg: '#fef6ee', color: '#f79009' },
  Design: { icon: Palette, bg: '#f9f5ff', color: '#7f56d9' },
  'Customer Success': { icon: Headset, bg: '#fef2f2', color: '#f04438' },
  Sales: { icon: Wallet, bg: '#fff7ed', color: '#c2410c' },
  Finance: { icon: Banknote, bg: '#fef3f2', color: '#b42318' },
  'Legal Ops': { icon: FileText, bg: '#eff8ff', color: '#2e90fa' },
};

const DepartmentPage = () => {
  // ... rest of the component
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [data] = useState(departmentList);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedSort, setSelectedSort] = useState('newest');

  const fetchDepartments = () => {
    setTimeout(() => {
      setIsLoading(true);
    }, 0);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    fetchDepartments();
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
          {data
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
          data={data}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      )}
    </div>
  );
};

export default DepartmentPage;
