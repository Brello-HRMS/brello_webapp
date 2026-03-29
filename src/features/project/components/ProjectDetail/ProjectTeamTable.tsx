import { useMemo } from 'react';
import { Users } from 'lucide-react';

import { DataTable } from '../../../../components/common';

import styles from './ProjectTeamTable.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type { Project, ProjectTeamMemberDetail, ProjectUser } from '../../types/projectType';

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
  const columns = useMemo<ColumnDef<ProjectTeamMemberDetail>[]>(
    () => [
      {
        accessorKey: 'user',
        header: 'Member',
        cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div className={styles.memberCell}>
              <UserAvatar user={user} />
              <div className={styles.memberInfo}>
                <span className={styles.memberName}>
                  {user?.first_name} {user?.last_name}
                </span>
                <span className={styles.memberEmail}>{user?.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
      },
    ],
    [],
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>
          <Users size={18} className={styles.icon} />
          Team Members
        </h3>
      </div>
      <div className={styles.tableWrapper}>
        <DataTable
          columns={columns}
          data={project.team || []}
          rowIdField="id"
          manualPagination={false}
        />
      </div>
    </div>
  );
};
