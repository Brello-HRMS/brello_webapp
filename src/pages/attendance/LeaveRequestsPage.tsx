import React from 'react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { LeaveRequestsListView } from '../../features/leave-management/components/LeaveRequestsListView';
import styles from '../../features/leave-management/styles/LeaveManagement.module.scss';

const LeaveRequestsPage: React.FC = () => {
  return (
    <div className={styles.dashboardContainer} style={{ background: 'none', padding: '0' }}>
      <PageHeader
        title="Leave Requests"
        subtitle="You have 7 Pending Leave Requests that need action!"
      />

      <div className={styles.tabContent}>
        <LeaveRequestsListView />
      </div>
    </div>
  );
};

export default LeaveRequestsPage;
