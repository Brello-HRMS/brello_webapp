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

  return (
    <div className={styles.header}>
      <div className={styles.titleSection}>
        <div className={styles.titleRow}>
          <h1>{project.name}</h1>
          <div className={styles.badges}>
            <span className={`${styles.statusTag} ${getStatusClass(project.project_status)}`}>
              {project.project_status}
            </span>
            <span className={`${styles.priorityTag} ${getPriorityClass(project.priority)}`}>
              {project.priority}
            </span>
          </div>
        </div>
        <div className={styles.metaInfo}>
          <span className={styles.projectId}>{project.id.split('-')[0].toUpperCase()}</span>
          <div className={styles.dot} />
          <span>{project.client?.name}</span>
        </div>
      </div>
    </div>
  );
};
