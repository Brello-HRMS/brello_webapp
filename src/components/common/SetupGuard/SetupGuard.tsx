import React from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { useOrgSetupStatus } from '../../../features/dashboard/hooks/useOrgSetupStatus';
import { AppId } from '../../../enum/app';
import { getCurrentAppId, isPlatformAdmin } from '../../../utils/authUtils';
import { SetupRequiredBlocker } from '../RequireAccess/SetupRequiredBlocker';
import styles from '../RequireAccess/RequireAccess.module.scss'; // Reuse loader styles

const ALLOWED_PATHS_REGEX = [
  /^\/$/,
  /^\/dashboard\/?$/,
  /^\/organisation\/departments(\/.*)?$/,
  /^\/organisation\/designations(\/.*)?$/,
  /^\/organisation\/policies(\/.*)?$/,
  /^\/organisation\/payroll(\/.*)?$/,
  /^\/organisation\/leave-config(\/.*)?$/,
  /^\/attendance\/setup(\/.*)?$/,
  /^\/employee\/directory(\/.*)?$/,
];

export const SetupGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPlatformAdminUser = isPlatformAdmin();
  const { data: setupData, isLoading: isSetupLoading } = useOrgSetupStatus({
    enabled: !isPlatformAdminUser,
  });
  const location = useLocation();
  const currentAppId = getCurrentAppId();
  const isAdmin = currentAppId === AppId.ADMIN;

  const isSetupIncomplete = isAdmin && setupData && setupData.completionPercentage < 100;

  if (isAdmin && isSetupLoading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spin} size={32} />
      </div>
    );
  }

  // If setup is incomplete and the current path is NOT allowed
  const isAllowedPath = ALLOWED_PATHS_REGEX.some((regex) => regex.test(location.pathname));

  if (isSetupIncomplete && !isAllowedPath) {
    return <SetupRequiredBlocker />;
  }

  return <>{children}</>;
};
