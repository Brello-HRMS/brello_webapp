import React from 'react';
import { TrendingDown, Info } from 'lucide-react';

import styles from '../PayrollEmployeeDetailPage.module.scss';

interface SalaryInfoBannerProps {
  isExceedingCtc: boolean;
  hasAutoAdjustedResidual: boolean;
  totalEarnings: number;
  ctc: string | number;
  formatCurrency: (value: number) => string;
}

export const SalaryInfoBanner: React.FC<SalaryInfoBannerProps> = ({
  isExceedingCtc,
  hasAutoAdjustedResidual,
  totalEarnings,
  ctc,
  formatCurrency,
}) => {
  if (isExceedingCtc) {
    return (
      <div className={styles.errorBanner}>
        <TrendingDown size={16} />
        <span>
          Total Earnings ({formatCurrency(totalEarnings)}) exceed Annual CTC (
          {formatCurrency(Number(ctc))}
          ). Please adjust components or CTC to continue.
        </span>
      </div>
    );
  }

  if (hasAutoAdjustedResidual) {
    return (
      <div className={styles.infoBanner}>
        <Info size={16} />
        <span>
          Note: The residual component has been automatically adjusted to maintain your Annual CTC.
        </span>
      </div>
    );
  }

  return null;
};
