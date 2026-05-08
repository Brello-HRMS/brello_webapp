import React, { useRef, useState } from 'react';

import { PageHeader } from '../../../components/common';
import ShiftsTab from '../../../features/attendance/setup/components/ShiftsTab';
import WeeklyOffsTab from '../../../features/attendance/setup/components/WeeklyOffsTab';
import RulesTab from '../../../features/attendance/setup/components/RulesTab';
import AssignTab from '../../../features/attendance/setup/components/AssignTab';
import {
  tabs,
  getTitleAndSubtitle,
  TabType,
} from '../../../features/attendance/setup/constants/setupConstants';

import styles from './AttendanceSetupPage.module.scss';

const AttendanceSetupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.SHIFTS);
  const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);
  const isMounted = useRef(false);

  const { title, subtitle } = getTitleAndSubtitle(activeTab);

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setHeaderActions(null);
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case TabType.SHIFTS:
        return <ShiftsTab setHeaderActions={setHeaderActions} />;
      case TabType.WEEKLY_OFFS:
        return <WeeklyOffsTab setHeaderActions={setHeaderActions} />;
      case TabType.RULES:
        return <RulesTab setHeaderActions={setHeaderActions} />;
      case TabType.ASSIGN:
        return <AssignTab setHeaderActions={setHeaderActions} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader title={title} subtitle={subtitle} actions={headerActions} />

      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <React.Fragment key={tab.id}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.number}. {tab.label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
};

export default AttendanceSetupPage;
