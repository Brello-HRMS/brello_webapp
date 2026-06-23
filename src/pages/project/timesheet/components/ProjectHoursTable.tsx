import React from 'react';

import styles from '../TimesheetPage.module.scss';

export interface ProjectData {
  id: string;
  name: string;
  color: string;
}

export interface TimesheetEntryData {
  id: string;
  projectId: string;
  projectName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hours: number;
  description: string;
  notes?: string;
  status: string;
}

interface ProjectHoursTableProps {
  projects: ProjectData[];
  entries: TimesheetEntryData[];
}

export const ProjectHoursTable: React.FC<ProjectHoursTableProps> = ({ projects, entries }) => {
  // Calculate total hours per project from entries
  const projectHours = React.useMemo(() => {
    const hoursMap: Record<string, number> = {};

    // Initialize map
    projects.forEach((p) => {
      hoursMap[p.id] = 0;
    });

    // Sum hours
    entries.forEach((entry) => {
      if (hoursMap[entry.projectId] !== undefined) {
        hoursMap[entry.projectId] += entry.hours;
      }
    });

    return hoursMap;
  }, [projects, entries]);

  return (
    <div className={styles.tableWrapper}>
      <h3 className={styles.tableTitle}>Project Breakdown</h3>
      <table className={styles.breakdownTable}>
        <thead>
          <tr>
            <th>Project</th>
            <th className={styles.textRight}>Hours</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const hours = projectHours[project.id] || 0;
            return (
              <tr key={project.id}>
                <td>
                  <div className={styles.projectNameCell}>
                    <span
                      className={styles.colorIndicator}
                      style={{ backgroundColor: project.color }}
                    />
                    <span className={styles.projectNameText}>{project.name}</span>
                  </div>
                </td>
                <td className={styles.hoursCell}>
                  {hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`}
                </td>
              </tr>
            );
          })}
          {projects.length === 0 && (
            <tr>
              <td colSpan={2} className={styles.emptyTable}>
                No projects assigned
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
