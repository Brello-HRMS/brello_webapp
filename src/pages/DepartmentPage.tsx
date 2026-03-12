import { useState } from 'react';

import { NoDataFound } from '../components/common/NoDataFound';
import { ListControls, type ViewType, type SortOption } from '../components/common';
import no_department from '../assets/svg/department/no_department_found.svg';

const sortOptions: SortOption[] = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Alphabetical (A-Z)', value: 'az' },
  { label: 'Alphabetical (Z-A)', value: 'za' },
];

const DepartmentPage = () => {
  const [departmentList] = useState(['ads']);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [selectedSort, setSelectedSort] = useState('newest');

  const handleAddDepartment = () => {};

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
    <div>
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
    </div>
  );
};

export default DepartmentPage;
