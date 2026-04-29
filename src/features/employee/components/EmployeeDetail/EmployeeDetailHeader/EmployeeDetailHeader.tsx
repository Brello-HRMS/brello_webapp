import React from 'react';

import { Button } from '../../../../../components/common';

import styles from './EmployeeDetailHeader.module.scss';

import type { EmployeeDetail } from '../../../types/employeeType';

interface EmployeeDetailHeaderProps {
  employee: EmployeeDetail;
}

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'];

const getAvatarColor = (name: string) => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const formatWorkModel = (val: string | null | undefined) => {
  if (!val) return '—';
  const map: Record<string, string> = {
    ONSITE: 'On-site',
    REMOTE: 'Remote',
    HYBRID: 'Hybrid',
  };
  return map[val] ?? val;
};

const formatEmploymentType = (val: string | null | undefined) => {
  if (!val) return '—';
  const map: Record<string, string> = {
    FULL_TIME: 'Full-Time',
    PART_TIME: 'Part-Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
  };
  return map[val] ?? val;
};

const formatDate = (val: string | null | undefined) => {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return val;
  }
};

export const EmployeeDetailHeader: React.FC<EmployeeDetailHeaderProps> = ({ employee }) => {
  const { firstName, lastName, profile } = employee;
  const empId = profile?.employeeId
    ? `EMP-${profile.employeeId}`
    : `EMP-${employee.id.substring(0, 3).toUpperCase()}`;
  const designation = profile?.designation || profile?.type || 'Employee';
  const bgColor = getAvatarColor(firstName);

  const metrics = [
    { label: 'Department', value: profile?.department || '—' },
    { label: 'Employment Type', value: formatEmploymentType(profile?.employmentType) },
    { label: 'Work Model', value: formatWorkModel(profile?.workModel) },
    { label: 'Join Date', value: formatDate(profile?.joiningDate) },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.topSection}>
        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarBox} style={{ background: `${bgColor}22` }}>
            <span className={styles.avatarInitials} style={{ color: bgColor }}>
              {getInitials(firstName, lastName)}
            </span>
          </div>
          <span className={styles.activeBadge}>
            <span className={styles.activeDot} />
            Active
          </span>
        </div>

        {/* Info */}
        <div className={styles.info}>
          <h2 className={styles.name}>
            {firstName} {lastName}
          </h2>
          <p className={styles.designation}>{designation}</p>
          <div className={styles.empIdChip}>ID: {empId}</div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className={styles.metricsSection}>
        {metrics.map((row) => (
          <div key={row.label} className={styles.metricRow}>
            <span className={styles.metricLabel}>{row.label}</span>
            <span className={styles.metricValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EmployeeDetailPageHeader: React.FC<{
  employee: EmployeeDetail;
  onOffboardClick?: () => void;
}> = ({ employee, onOffboardClick }) => {
  const empId = employee.profile?.employeeId
    ? `EMP-${employee.profile.employeeId}`
    : `EMP-${employee.id.substring(0, 3).toUpperCase()}`;

  return (
    <div className={styles.pageHeaderRow}>
      <div>
        <h1 className={styles.pageTitle}>
          {employee.firstName} {employee.lastName}
        </h1>
        <p className={styles.pageSubtitle}>{empId}</p>
      </div>
      <Button variant="primary" onClick={onOffboardClick} className={styles.offboardBtn}>
        Offboard Employee
      </Button>
    </div>
  );
};
