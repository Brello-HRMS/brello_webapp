import React from 'react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { LeaveBalanceView } from '../../features/leave-management/components/LeaveBalanceView';
import styles from '../../features/leave-management/styles/LeaveManagement.module.scss';

const LeaveManagementPage: React.FC = () => {
  return (
    <div className={styles.dashboardContainer} style={{ background: 'none', padding: '0' }}>
      <PageHeader title="Leave Balance" subtitle="View available and used leave for employees." />

      <div className={styles.tabContent}>
        <LeaveBalanceView />
      </div>
    </div>
  );
};

export default LeaveManagementPage;
