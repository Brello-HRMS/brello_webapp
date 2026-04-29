import React from 'react';
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';

import styles from './PersonalInfoCard.module.scss';

import type { EmployeeDetail } from '../../../types/employeeType';

interface PersonalInfoCardProps {
  employee: EmployeeDetail;
}

const formatDob = (dob: string | null | undefined): string => {
  if (!dob) return '—';
  try {
    return new Date(dob).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dob;
  }
};

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ employee }) => {
  const { email, phone, profile } = employee;

  const rows = [
    { icon: <Calendar size={18} />, label: 'Date of Birth', value: formatDob(profile?.dob) },
    { icon: <Mail size={18} />, label: 'Email Address', value: email || '—' },
    { icon: <Phone size={18} />, label: 'Phone', value: phone ? `+91 ${phone}` : '—' },
    { icon: <MapPin size={18} />, label: 'Address', value: profile?.address || '—' },
  ];

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Personal Info</h3>
      <div className={styles.list}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <div className={styles.iconWrapper}>{row.icon}</div>
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
