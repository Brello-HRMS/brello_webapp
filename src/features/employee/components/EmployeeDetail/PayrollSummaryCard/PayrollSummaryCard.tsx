import React from 'react';
import { Info } from 'lucide-react';

import styles from './PayrollSummaryCard.module.scss';

import type { EmployeeDetail } from '../../../types/employeeType';

interface PayrollSummaryCardProps {
  employee: EmployeeDetail;
}

const formatCurrency = (val: string | null | undefined): string => {
  if (!val) return '—';
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return `₹${num.toLocaleString('en-IN')}`;
};

const maskAccountNumber = (acc: string | null | undefined): string => {
  if (!acc) return '—';
  if (acc.length <= 4) return acc;
  return `${'•'.repeat(acc.length - 4)}${acc.slice(-4)}`;
};

export const PayrollSummaryCard: React.FC<PayrollSummaryCardProps> = ({ employee }) => {
  const { profile, bankInfo, govInfo } = employee;

  const totalCtc = profile?.totalCtc || profile?.annualCtc;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Payroll Summary</h3>

      {/* Salary Structure */}
      <div className={styles.subSectionLabel}>SALARY STRUCTURE</div>
      <div className={styles.infoRows}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Annual CTC</span>
          <span className={styles.infoValue}>{formatCurrency(profile?.annualCtc)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Monthly Gross</span>
          <span className={styles.infoValue}>{formatCurrency(profile?.monthlyGross)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Allowances</span>
          <span className={styles.infoValue}>{formatCurrency(profile?.allowances)}</span>
        </div>
      </div>

      {/* Total CTC highlight box */}
      <div className={styles.totalCtcBox}>
        <div className={styles.totalCtcContent}>
          <span className={styles.totalCtcLabel}>Total CTC</span>
          <span className={styles.totalCtcValue}>{formatCurrency(totalCtc)}</span>
        </div>
        <Info size={15} className={styles.totalCtcIcon} />
      </div>

      <div className={styles.divider} />

      {/* Bank Details */}
      <div className={styles.subSectionLabel}>SALARY STRUCTURE</div>
      <div className={styles.infoRows}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>A/c no.</span>
          <span className={styles.infoValue}>{maskAccountNumber(bankInfo?.account_number)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Bank Name</span>
          <span className={styles.infoValue}>{bankInfo?.bank_name || '—'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>IFSC</span>
          <span className={styles.infoValue}>{bankInfo?.ifsc_code || '—'}</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Tax & Gov Info */}
      <div className={styles.subSectionLabel}>TAX & PF INFO</div>
      <div className={styles.infoRows}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Pan Number</span>
          <span className={styles.infoValue}>{govInfo?.pan || '—'}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Tax Regime</span>
          <span className={styles.infoValue}>
            {profile?.taxRegime === 'NEW'
              ? 'New Regime'
              : profile?.taxRegime === 'OLD'
                ? 'Old Regime'
                : '—'}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>UAN Number</span>
          <span className={styles.infoValue}>{govInfo?.uan || '—'}</span>
        </div>
      </div>
    </div>
  );
};
