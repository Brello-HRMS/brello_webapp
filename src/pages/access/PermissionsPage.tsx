import React, { useState, useMemo } from 'react';
import { Check, X, Loader2, Save, AlertCircle } from 'lucide-react';

import { PageHeader, Checkbox, Select } from '../../components/common';
import { getAvailableApps } from '../../utils/authUtils';
import { useRoles } from '../../features/access/roles/hooks/useRoles';
import {
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '../../features/access/permissions/hooks/usePermissions';

import styles from './PermissionsPage.module.scss';

import type { Role } from '../../features/access/roles/types';

interface Permission {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  appId?: string;
  moduleId: string;
  actionId: string;
}

const EMPTY_PERMISSIONS: Permission[] = [];

const PermissionsPage: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const { roles, isLoading: isRolesLoading } = useRoles();
  const availableApps = getAvailableApps();

  const { data: serverPermissions = EMPTY_PERMISSIONS, isFetching: isPermissionsLoading } =
    useRolePermissionsQuery(selectedRoleId);
  const { mutate: updatePermissions, isPending: isUpdating } = useUpdateRolePermissionsMutation();

  const [prevServerPermissions, setPrevServerPermissions] = useState<Permission[]>([]);
  if (serverPermissions !== prevServerPermissions) {
    setPrevServerPermissions(serverPermissions);
    setPermissions(serverPermissions);
  }

  const selectedRole = useMemo(
    () => roles.find((r: Role) => r.id === selectedRoleId),
    [roles, selectedRoleId],
  );

  const isSystemRole = selectedRole?.is_system_role || false;
  const isDirty = JSON.stringify(permissions) !== JSON.stringify(serverPermissions);

  const roleOptions = useMemo(() => {
    const filteredRoles = selectedAppId
      ? roles.filter((r: Role) => r.app_id === selectedAppId)
      : roles;
    return [
      { label: 'Select Role', value: '' },
      ...filteredRoles.map((role: Role) => ({ label: role.name, value: role.id })),
    ];
  }, [roles, selectedAppId]);

  const appOptions = useMemo(
    () => [
      { label: 'Select App', value: '' },
      ...availableApps.map((app) => ({ label: app.name, value: app.id })),
    ],
    [availableApps],
  );

  const handleAppChange = (val: string) => {
    setSelectedAppId(val);
    setSelectedRoleId('');
  };

  const handleRoleChange = (val: string) => {
    setSelectedRoleId(val);
    const role = roles.find((r: Role) => r.id === val);
    if (role && role.app_id) {
      setSelectedAppId(role.app_id);
    }
  };

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((perm) => {
      if (!groups[perm.category]) groups[perm.category] = [];
      groups[perm.category].push(perm);
    });
    return groups;
  }, [permissions]);

  const handleTogglePermission = (id: string) => {
    if (isSystemRole) return;
    setPermissions((prev) => prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)));
  };

  const handleAllowAll = (category: string) => {
    if (isSystemRole) return;
    setPermissions((prev) =>
      prev.map((p) => (p.category === category ? { ...p, checked: true } : p)),
    );
  };

  const handleRevokeAll = (category: string) => {
    if (isSystemRole) return;
    setPermissions((prev) =>
      prev.map((p) => (p.category === category ? { ...p, checked: false } : p)),
    );
  };

  const handleSave = () => {
    if (!selectedRoleId || isSystemRole) return;
    const payload = permissions.map((p) => ({
      module_id: p.moduleId,
      action_id: p.actionId,
      checked: p.checked,
    }));
    updatePermissions({ roleId: selectedRoleId, permissions: payload });
  };

  const isPartial = (category: string) => {
    const group = groupedPermissions[category];
    const checkedCount = group.filter((p) => p.checked).length;
    return checkedCount > 0 && checkedCount < group.length;
  };

  if (isRolesLoading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spin} size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.headerContainer}>
        <PageHeader title="Permissions" subtitle="Control feature-level access for roles." />
        {selectedRoleId && !isSystemRole && (
          <button
            className={`${styles.saveButton} ${isDirty ? styles.saveDirty : styles.saveClean}`}
            onClick={handleSave}
            disabled={isUpdating || !isDirty}
          >
            {isUpdating ? <Loader2 className={styles.spin} size={16} /> : <Save size={16} />}
            Save Changes
          </button>
        )}
      </div>

      <div className={styles.permissionsContainer}>
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label>App</label>
            <div className={styles.select}>
              <Select
                options={appOptions}
                value={selectedAppId}
                onChange={(val) => handleAppChange(val as string)}
              />
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label>Role</label>
            <div className={styles.select}>
              <Select
                options={roleOptions}
                value={selectedRoleId}
                onChange={(val) => handleRoleChange(val as string)}
              />
            </div>
          </div>
        </div>

        {isSystemRole && (
          <div className={styles.systemRoleWarning}>
            <AlertCircle size={16} />
            This is a system role. Permissions cannot be modified directly.
          </div>
        )}

        {!selectedRoleId ? (
          <div className={styles.emptyState}>
            Please select an app and a role to view permissions.
          </div>
        ) : isPermissionsLoading ? (
          <div className={styles.loader}>
            <Loader2 className={styles.spin} size={32} />
          </div>
        ) : permissions.length === 0 ? (
          <div className={styles.emptyState}>
            No permissions available for this role's app in the current plan.
          </div>
        ) : (
          <div className={styles.permissionGroups}>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className={styles.groupCard}>
                <div className={styles.groupHeader}>
                  <div className={styles.groupInfo}>
                    <h3>{category}</h3>
                    {isPartial(category) && <span className={styles.partialBadge}>Partial</span>}
                  </div>
                  {!isSystemRole && (
                    <div className={styles.groupActions}>
                      <button
                        className={`${styles.actionButton} ${styles.allowAll}`}
                        onClick={() => handleAllowAll(category)}
                      >
                        <Check size={16} /> Allow all
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.revokeAll}`}
                        onClick={() => handleRevokeAll(category)}
                      >
                        <X size={16} /> Revoke all
                      </button>
                    </div>
                  )}
                </div>
                <div className={styles.groupBody}>
                  {perms.map((perm) => (
                    <div
                      key={perm.id}
                      className={`${styles.permissionCard} ${perm.checked ? styles.checked : ''} ${isSystemRole ? styles.disabled : ''}`}
                      onClick={() => handleTogglePermission(perm.id)}
                    >
                      <Checkbox
                        checked={perm.checked}
                        onChange={() => {}}
                        className={styles.checkbox}
                        disabled={isSystemRole}
                      />
                      <span className={styles.permissionLabel}>{perm.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsPage;
