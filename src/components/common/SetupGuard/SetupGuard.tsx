import React from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useOrgSetupStatus } from '../../../features/dashboard/hooks/useOrgSetupStatus';
import { isAdminApp, isPlatformAdmin } from '../../../utils/authUtils';
import { SetupRequiredBlocker } from '../RequireAccess/SetupRequiredBlocker';
import styles from '../RequireAccess/RequireAccess.module.scss'; // Reuse loader styles

export const SETUP_FREE_PATHS = [
  /^\/$/,
  /^\/dashboard\/?$/,
  /^\/organisation\/departments(\/.*)?$/,
  /^\/organisation\/designations(\/.*)?$/,
  /^\/organisation\/policies(\/.*)?$/,
  /^\/organisation\/payroll(\/.*)?$/,
  /^\/organisation\/leave-config(\/.*)?$/,
  /^\/attendance\/setup(\/.*)?$/,
  /^\/employee\/directory(\/.*)?$/,
  /^\/billing(\/.*)?$/,
];

export const SetupGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPlatformAdminUser = isPlatformAdmin();
  const { data: setupData, isLoading: isSetupLoading } = useOrgSetupStatus({
    enabled: !isPlatformAdminUser,
  });
  const location = useLocation();
  const isAdmin = isAdminApp();

  const isSetupIncomplete = isAdmin && setupData && setupData.completionPercentage < 100;

  if (isAdmin && isSetupLoading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spin} size={32} />
      </div>
    );
  }

  // If setup is incomplete and the current path is NOT allowed
  const isAllowedPath = SETUP_FREE_PATHS.some((regex) => regex.test(location.pathname));

  if (isSetupIncomplete && !isAllowedPath) {
    return <SetupRequiredBlocker />;
  }

  return <>{children}</>;
};
