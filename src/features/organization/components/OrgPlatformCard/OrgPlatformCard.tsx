import React from 'react';
import { Calendar, Users, ExternalLink, Building2, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import styles from './OrgPlatformCard.module.scss';

import type { OrganizationProfile } from '../../types';
import type { OrgStats } from '../../types';

interface OrgPlatformCardProps {
  profile: OrganizationProfile;
  stats: OrgStats | undefined;
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const OrgPlatformCard: React.FC<OrgPlatformCardProps> = ({ profile, stats }) => {
  const navigate = useNavigate();

  const rows = [
    {
      icon: <Hash size={18} />,
      label: 'Organisation ID',
      value: <span className={styles.mono}>{profile.organization_id}</span>,
    },
    {
      icon: <Calendar size={18} />,
      label: 'Created On',
      value: formatDate(profile.organization?.created_at ?? profile.created_at),
    },
    {
      icon: <Users size={18} />,
      label: 'Total Employees',
      value: stats?.employee_count != null ? String(stats.employee_count) : '—',
    },
    {
      icon: <Building2 size={18} />,
      label: 'Billing',
      value: (
        <button className={styles.link} onClick={() => navigate('/billing/plan')}>
          View Plan <ExternalLink size={12} />
        </button>
      ),
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>Platform Info</h3>
        <span className={styles.readOnly}>Read-only</span>
      </div>
      <div className={styles.list}>
        {rows.map((row, i) => (
          <div key={i} className={styles.row}>
            <div className={styles.icon}>{row.icon}</div>
            <div className={styles.content}>
              <span className={styles.label}>{row.label}</span>
              <span className={styles.value}>{row.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
