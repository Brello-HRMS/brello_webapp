import { useEffect, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';

import { DataTable } from '../components/common/DataTable';
import { NoDataFound } from '../components/common/NoDataFound';
import { ListControls, type ViewType, type SortOption } from '../components/common';
import no_department from '../assets/svg/department/no_department_found.svg';
import { PageHeader } from '../components/common/PageHeader/PageHeader';
import { Button } from '../components/common/Button/Button';
import { departmentList } from '../features/department/data/departmentData';
import { departmentColumns } from '../features/department/columns/departmentColumns';
import { useDebounce } from '../hooks/useDebounce';

const sortOptions: SortOption[] = [
  { label: 'Alphabetical (A-Z)', value: 'az' },
  { label: 'Alphabetical (Z-A)', value: 'za' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
];

const DepartmentPage = () => {
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

      {viewType === 'grid' ? (
        <div
          style={{
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredAndSortedData.map((department) => (
            <div
              key={department.id}
              style={{
                padding: '20px',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                background: 'var(--color-white)',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0' }}>{department.name}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '0' }}>
                {department.designation}
              </p>
            </div>
          ))}
          {filteredAndSortedData.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              No departments found matching your search.
            </div>
          )}
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
