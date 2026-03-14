import React from 'react';
import { Download, Plus } from 'lucide-react';

import { NoDataFound } from '../components/common/NoDataFound';
import no_department from '../assets/svg/department/no_department_found.svg';
import { PageHeader } from '../components/common/PageHeader/PageHeader';
import { Button } from '../components/common/Button/Button';

const DepartmentPage = () => {
  const [departmentList] = React.useState(['sd']);

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
    </div>
  );
};

export default DepartmentPage;
