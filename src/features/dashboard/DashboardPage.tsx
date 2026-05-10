import React from 'react';
import { Users, CalendarCheck2, HandCoins } from 'lucide-react';

import { getAuthUser } from '../../utils/authUtils';
import { getGreeting } from '../../utils/timeUtils';

import { SceneBanner } from './components/SceneBanner/SceneBanner';
import { ClockInCard } from './components/ClockInCard/ClockInCard';
import { StatCard } from './components/StatCard/StatCard';
import { ApprovalRequestsCard } from './components/ApprovalRequestsCard/ApprovalRequestsCard';
import { BirthdaysCard } from './components/BirthdaysCard/BirthdaysCard';
import { AnnouncementCard } from './components/AnnouncementCard/AnnouncementCard';
import { DailyAttendanceReport } from './components/DailyAttendanceReport/DailyAttendanceReport';
import { HolidaysCard } from './components/HolidaysCard/HolidaysCard';
import { NewHiresCard } from './components/NewHiresCard/NewHiresCard';
import { useDashboard } from './hooks/useDashboard';
import styles from './DashboardPage.module.scss';

export const DashboardPage: React.FC = () => {
  const data = useDashboard();
  const user = getAuthUser();
  const firstName = user?.first_name ?? 'there';
  const greeting = getGreeting();

  const totalApprovals = data.approvalItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={styles.page}>
      {/* Hero: left = greeting + clock · right = banner + stat cards */}
      <div className={styles.hero}>
        {/* Left column */}
        <div className={styles.heroLeft}>
          <div className={styles.greeting}>
            <h1 className={styles.greetingTitle}>
              {greeting}, {firstName}!
            </h1>
            <p className={styles.greetingSubtitle}>Here is your monthly overview.</p>
          </div>
          <ClockInCard />
        </div>

        {/* Right column */}
        <div className={styles.heroRight}>
          <div className={styles.heroBanner}>
            <SceneBanner />
          </div>
          <div className={styles.statsRow}>
            <StatCard
              label="Total Employees"
              value={String(data.stats.totalEmployees)}
              icon={Users}
              trend={{ value: data.stats.employeeTrend, direction: 'up' }}
            />
            <StatCard
              label="Attendance"
              value={data.stats.attendancePercent}
              icon={CalendarCheck2}
              trend={{ value: data.stats.attendanceTrend, direction: 'up' }}
            />
            <StatCard
              label="Payroll"
              value={data.stats.payrollAmount}
              icon={HandCoins}
              subtitle="This month"
            />
          </div>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className={styles.grid}>
        <ApprovalRequestsCard items={data.approvalItems} totalCount={totalApprovals} />
        <BirthdaysCard birthdays={data.birthdays} />
        <AnnouncementCard todayCount={data.announcementCount} />
        <DailyAttendanceReport rows={data.attendanceReport} />
        <HolidaysCard holidays={data.holidays} count={data.holidayCount} />
        <NewHiresCard hires={data.newHires} />
      </div>
    </div>
  );
};
