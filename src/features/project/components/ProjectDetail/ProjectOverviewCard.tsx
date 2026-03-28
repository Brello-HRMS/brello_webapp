import { Briefcase } from 'lucide-react';

import styles from './ProjectOverviewCard.module.scss';

import type { Project } from '../../types/projectType';

interface ProjectOverviewCardProps {
  project: Project;
}

export const ProjectOverviewCard = ({ project }: ProjectOverviewCardProps) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>
          <Briefcase size={18} className={styles.icon} />
          Project Overview
        </h3>
      </div>
      <div className={styles.overviewGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Project ID</span>
          <span className={styles.infoValue}>{project.id.split('-')[0].toUpperCase()}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Project Type</span>
          <span className={styles.infoValue}>{project.project_type}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Start Date</span>
          <span className={styles.infoValue}>{formatDate(project.start_date)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>End Date</span>
          <span className={styles.infoValue}>{formatDate(project.end_date)}</span>
        </div>
        <div className={`${styles.infoItem} ${styles.fullWidth}`}>
          <span className={styles.infoLabel}>Project Description</span>
          <p className={styles.infoValue}>{project.description || 'No description provided.'}</p>
        </div>
      </div>
    </div>
  );
};
