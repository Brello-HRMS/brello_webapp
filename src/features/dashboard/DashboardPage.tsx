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
import { SetupGuide } from './components/SetupGuide/SetupGuide';
import { EmployeeDailyAttendanceCard } from './components/EmployeeDailyAttendanceCard/EmployeeDailyAttendanceCard';
import { useDashboardWidgets, DashboardWidget } from './config/dashboardWidgets';
import { useDashboard } from './hooks/useDashboard';
import { useDashboardStats } from './hooks/useDashboardStats';
import styles from './DashboardPage.module.scss';

export const DashboardPage: React.FC = () => {
  const data = useDashboard();
  const stats = useDashboardStats();
  const user = getAuthUser();
  const { canView } = useDashboardWidgets();

  const firstName = user?.first_name ?? 'there';
  const greeting = getGreeting();

  const totalApprovals = data.approvalItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={styles.page}>
      {/* Hero: left = greeting + clock · right = banner + stat cards */}
      <div className={styles.heroContainer}>
        {/* Left column */}
        <div className={styles.greeting}>
          <h1 className={styles.greetingTitle}>
            {greeting}, {firstName}!
          </h1>
          <p className={styles.greetingSubtitle}>Here is your monthly overview.</p>
        </div>
        <div className={styles.heroBanner}>
          <SceneBanner />
        </div>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <ClockInCard />
          </div>
          <div className={styles.heroRight}>
            {canView(DashboardWidget.HERO_STATS) && (
              <div className={styles.statsRow}>
                <StatCard
                  label="Total Employees"
                  value={stats.totalEmployees != null ? String(stats.totalEmployees) : '—'}
                  icon={Users}
                  trend={
                    stats.employeeTrend
                      ? {
                          value: stats.employeeTrend,
                          direction: stats.employeeTrend.startsWith('-') ? 'down' : 'up',
                        }
                      : undefined
                  }
                />
                <StatCard
                  label="Attendance"
                  value={stats.attendancePercent ?? '—'}
                  icon={CalendarCheck2}
                  trend={
                    stats.attendanceTrend
                      ? {
                          value: stats.attendanceTrend,
                          direction: stats.attendanceTrend.startsWith('-') ? 'down' : 'up',
                        }
                      : undefined
                  }
                />
                <StatCard
                  label="Payroll"
                  value={data.stats.payrollAmount}
                  icon={HandCoins}
                  subtitle="This month"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className={styles.grid}>
        {canView(DashboardWidget.APPROVAL_REQUESTS) && (
          <ApprovalRequestsCard items={data.approvalItems} totalCount={totalApprovals} />
        )}
        {canView(DashboardWidget.BIRTHDAYS) && <BirthdaysCard />}
        {canView(DashboardWidget.ANNOUNCEMENTS) && (
          <AnnouncementCard todayCount={data.announcementCount} />
        )}
        {canView(DashboardWidget.DAILY_ATTENDANCE_REPORT) && <DailyAttendanceReport />}
        {canView(DashboardWidget.EMPLOYEE_DAILY_ATTENDANCE) && <EmployeeDailyAttendanceCard />}
        {canView(DashboardWidget.HOLIDAYS) && <HolidaysCard />}
        {canView(DashboardWidget.NEW_HIRES) && <NewHiresCard />}
      </div>
      {canView(DashboardWidget.SETUP_GUIDE) && <SetupGuide />}
    </div>
  );
};
