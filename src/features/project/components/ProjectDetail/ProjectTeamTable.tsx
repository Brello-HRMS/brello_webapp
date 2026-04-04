import { Users } from 'lucide-react';

import styles from './ProjectTeamTable.module.scss';

import type { Project, ProjectUser } from '../../types/projectType';

interface ProjectTeamTableProps {
  project: Project;
}

interface UserAvatarProps {
  user: ProjectUser;
}

const UserAvatar = ({ user }: UserAvatarProps) => {
  const initials =
    `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`.toUpperCase();

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.first_name} ${user.last_name}`}
        className={styles.avatarImg}
      />
    );
  }

  return <div className={styles.avatar}>{initials}</div>;
};

export const ProjectTeamTable = ({ project }: ProjectTeamTableProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>
          <Users size={18} className={styles.icon} />
          Team Members
        </h3>
      </div>
      <div className={styles.membersGrid}>
        {project.team?.map((member) => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.cardMain}>
              <UserAvatar user={member.user} />
              <span className={styles.employeeId}>
                EMP-{member.user.id.split('-')[0].toUpperCase().substring(0, 3)}
              </span>
              <span className={styles.memberName}>
                {member.user.first_name} {member.user.last_name}
              </span>
            </div>
            <div className={styles.roleSection}>
              <span className={styles.roleLabel}>Role</span>
              <span className={styles.roleValue}>{member.role || 'Member'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
