import React from 'react';

import { NoDataFound } from '../components/common/NoDataFound';
import no_department from '../assets/svg/department/no_department_found.svg';

const DepartmentPage = () => {
  const [departmentList] = React.useState([]);

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

  return <div>DepartmentPage dsf</div>;
};

export default DepartmentPage;
