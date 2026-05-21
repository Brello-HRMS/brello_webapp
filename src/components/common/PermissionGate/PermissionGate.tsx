import { useModuleAccess } from '../../../hooks/useModuleAccess';
import { capitalize } from '../../../utils/stringUtils';

import type { ReactNode } from 'react';
import type { AccessMap } from '../../../hooks/useModuleAccess';
import type { ModuleCode, ActionCode } from '../../../enum/modules';

interface PermissionGateProps {
  module: ModuleCode;
  action: ActionCode;
  children: ReactNode;
  /** Rendered when the user lacks permission. Defaults to null. */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the user's action permission for a module.
 * Use for button-level / element-level access control within a page.
 *
 * @example
 * <PermissionGate module={ModuleCode.ORG_DEPARTMENTS} action={ActionCode.CREATE}>
 *   <Button>Add Department</Button>
 * </PermissionGate>
 */
export const PermissionGate = ({
  module,
  action,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const access = useModuleAccess(module);

  // Hide during loading so buttons don't flash in then disappear
  if (access.isLoading) return null;

  const key = `has${capitalize(action)}Access` as keyof AccessMap;
  return <>{access[key] ? children : fallback}</>;
};
