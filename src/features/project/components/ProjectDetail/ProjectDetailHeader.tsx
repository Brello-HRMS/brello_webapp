import { ProjectStatus, ProjectPriority } from '../../types/projectType';

import styles from './ProjectDetailHeader.module.scss';

import type { Project } from '../../types/projectType';

interface ProjectDetailHeaderProps {
  project: Project;
}

export const ProjectDetailHeader = ({ project }: ProjectDetailHeaderProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS:
        return styles.inProgress;
      case ProjectStatus.ACTIVE:
        return styles.active;
      case ProjectStatus.COMPLETED:
        return styles.completed;
      case ProjectStatus.ON_HOLD:
        return styles.onHold;
      default:
        return '';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case ProjectPriority.HIGH:
        return styles.high;
      case ProjectPriority.MEDIUM:
        return styles.medium;
      case ProjectPriority.LOW:
        return styles.low;
      case ProjectPriority.URGENT:
        return styles.urgent;
      default:
        return '';
    }
  };

  const formattedStatus = project.project_status
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.badges}>
          <span className={`${styles.statusTag} ${getStatusClass(project.project_status)}`}>
            {formattedStatus}
          </span>
          <span className={`${styles.priorityTag} ${getPriorityClass(project.priority)}`}>
            {project.priority}
          </span>
        </div>

        <h1 className={styles.title}>{project.name}</h1>

        <div className={styles.metaInfo}>
          <span className={styles.projectId}>{project.id.split('-')[0].toUpperCase()}</span>
          <div className={styles.dot} />
          <span>{project.client?.name}</span>
          <div className={styles.dot} />
          <span>{project.project_type}</span>
        </div>
      </div>

      <div className={styles.dateSection}>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>Start Date</span>
          <span className={styles.dateValue}>{formatDate(project.start_date)}</span>
        </div>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>End Date</span>
          <span className={styles.dateValue}>{formatDate(project.end_date)}</span>
        </div>
      </div>
    </div>
  );
};
