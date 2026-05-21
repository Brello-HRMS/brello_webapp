import { Loader2 } from 'lucide-react';

import ForbiddenPage from '../../../pages/ForbiddenPage';
import { useModuleAccess } from '../../../hooks/useModuleAccess';

import styles from './RequireAccess.module.scss';

import type { ModuleCode } from '../../../enum/modules';
import type { ReactNode } from 'react';

interface RequireAccessProps {
  /** The module that must have 'view' access for the children to render. */
  module: ModuleCode;
  children: ReactNode;
}

/**
 * Route-level permission wrapper.
 * Shows a spinner while permissions are resolving, then either renders
 * the page or the 403 ForbiddenPage.
 *
 * @example
 * // In routes/index.tsx
 * element: <RequireAccess module={ModuleCode.ACCESS_ROLES}><RolesPage /></RequireAccess>
 */
export const RequireAccess = ({ module, children }: RequireAccessProps) => {
  const { hasViewAccess, isLoading } = useModuleAccess(module);

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spin} size={32} />
      </div>
    );
  }

  if (!hasViewAccess) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};
