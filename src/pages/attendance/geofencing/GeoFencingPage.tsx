import React from 'react';

import { PageHeader, NoDataFound } from '../../../components/common';
import noDataImage from '../../../assets/svg/department/no_department_found.svg';

import styles from './GeoFencingPage.module.scss';

const GeoFencingPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Geo Fencing"
        subtitle="Configure geographic boundaries for attendance tracking"
      />

      <NoDataFound
        title="Geo Fencing Under Development"
        description="This module is currently being configured. You will soon be able to define locations and radii for geofenced attendance."
        noDataImage={noDataImage}
        noDataImageAlt="Under construction"
      />
    </div>
  );
};

export default GeoFencingPage;
