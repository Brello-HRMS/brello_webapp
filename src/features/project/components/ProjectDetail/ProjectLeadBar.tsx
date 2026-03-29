import { UserCheck } from 'lucide-react';

import styles from './ProjectLeadBar.module.scss';

import type { Project } from '../../types/projectType';

interface ProjectLeadBarProps {
  project: Project;
}

export const ProjectLeadBar = ({ project }: ProjectLeadBarProps) => {
  const lead = project.team?.find((m) => m.user_id === project.lead_id);

  return (
    <div className={styles.projectLeadBar}>
      <span className={styles.label}>Project Lead</span>
      <div className={styles.leadInfo}>
        <div className={styles.avatar}>
          {lead?.user?.first_name?.charAt(0) || <UserCheck size={16} />}
        </div>
        <span className={styles.name}>
          {lead?.user?.first_name} {lead?.user?.last_name || '-'}
        </span>
      </div>
    </div>
  );
};
