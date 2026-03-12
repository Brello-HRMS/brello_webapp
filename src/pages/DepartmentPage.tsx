import { useEffect, useState } from 'react';
import { Download, Plus } from 'lucide-react';

import { DataTable } from '../components/common/DataTable';
import { NoDataFound } from '../components/common/NoDataFound';
import { ListControls, type ViewType, type SortOption } from '../components/common';
import no_department from '../assets/svg/department/no_department_found.svg';
import { PageHeader } from '../components/common/PageHeader/PageHeader';
import { Button } from '../components/common/Button/Button';
import { departmentList } from '../features/department/data/departmentData';
import { departmentColumns } from '../features/department/columns/departmentColumns';

const sortOptions: SortOption[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Alphabetical (A-Z)', value: 'az' },
  { label: 'Alphabetical (Z-A)', value: 'za' },
];

const DepartmentPage = () => {
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
    <div style={{ opacity: isLoading ? 0.4 : 1, transition: 'opacity 0.2s' }}>
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
      <div style={{ marginTop: '24px' }}>
        {viewType === 'grid' ? (
          <div>
            Grid View Content (Search: {searchQuery}, Sort: {selectedSort})
          </div>
        ) : (
          <div>
            Table View Content (Search: {searchQuery}, Sort: {selectedSort})
          </div>
        )}
      </div>
      <DataTable
        columns={departmentColumns}
        data={data}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
};

export default DepartmentPage;
