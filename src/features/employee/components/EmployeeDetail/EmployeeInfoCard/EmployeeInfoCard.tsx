import React from 'react';

import styles from './EmployeeInfoCard.module.scss';

import type { EmployeeDetail } from '../../../types/employeeType';

interface EmployeeInfoCardProps {
  employee: EmployeeDetail;
}

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

export const EmployeeInfoCard: React.FC<EmployeeInfoCardProps> = ({ employee }) => {
  const { profile } = employee;

  const rows: { label: string; value: string }[] = [
    { label: 'Department', value: profile?.department || '—' },
    { label: 'Employment Type', value: formatEmploymentType(profile?.employmentType) },
    { label: 'Work Model', value: formatWorkModel(profile?.workModel) },
    { label: 'Join Date', value: formatDate(profile?.joiningDate) },
  ];

  return (
    <div className={styles.card}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <span className={styles.label}>{row.label}</span>
          <span className={styles.value}>{row.value}</span>
        </div>
      ))}
    </div>
  );
};
