import React from 'react';
import moment from 'moment';
import { Briefcase, Calendar, Clock } from 'lucide-react';

import styles from '../TimesheetPage.module.scss';

import { ProjectHoursTable, type ProjectData, type TimesheetEntryData } from './ProjectHoursTable';

interface ProjectSummaryCardProps {
  projects: ProjectData[];
  entries: TimesheetEntryData[];
}

export const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ projects, entries }) => {
  // Compute hours this week
  const hoursThisWeek = React.useMemo(() => {
    return entries
      .filter((entry) => moment(entry.date).isSame(moment(), 'isoWeek'))
      .reduce((sum, entry) => sum + entry.hours, 0);
  }, [entries]);

  // Compute hours this month
  const hoursThisMonth = React.useMemo(() => {
    return entries
      .filter((entry) => moment(entry.date).isSame(moment(), 'month'))
      .reduce((sum, entry) => sum + entry.hours, 0);
  }, [entries]);

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.metricsGrid}>
        {/* Total Projects Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconContainer} ${styles.purpleIcon}`}>
              <Briefcase size={20} />
            </div>
            <span className={styles.metricLabel}>Projects Assigned</span>
          </div>
          <div className={styles.metricValue}>{projects.length}</div>
          <span className={styles.metricSubtext}>Across all clients</span>
        </div>

        {/* Total Hours Week Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconContainer} ${styles.blueIcon}`}>
              <Calendar size={20} />
            </div>
            <span className={styles.metricLabel}>Hours This Week</span>
          </div>
          <div className={styles.metricValue}>
            {hoursThisWeek % 1 === 0 ? `${hoursThisWeek}h` : `${hoursThisWeek.toFixed(1)}h`}
          </div>
          <span className={styles.metricSubtext}>Mon - Sun current week</span>
        </div>

        {/* Total Hours Month Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <div className={`${styles.iconContainer} ${styles.greenIcon}`}>
              <Clock size={20} />
            </div>
            <span className={styles.metricLabel}>Hours This Month</span>
          </div>
          <div className={styles.metricValue}>
            {hoursThisMonth % 1 === 0 ? `${hoursThisMonth}h` : `${hoursThisMonth.toFixed(1)}h`}
          </div>
          <span className={styles.metricSubtext}>Current calendar month</span>
        </div>
      </div>

      {/* Project Hours Table */}
      <ProjectHoursTable projects={projects} entries={entries} />
    </div>
  );
};
