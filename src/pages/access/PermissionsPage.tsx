import React, { useState, useMemo } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

import { PageHeader, Checkbox, Select } from '../../components/common';
import { getAvailableApps } from '../../utils/authUtils';
import { useRoles } from '../../features/access/roles/hooks/useRoles';

import styles from './PermissionsPage.module.scss';

import type { Role } from '../../features/access/roles/types';

interface Permission {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  appId?: string;
}

const MOCK_PERMISSIONS: Permission[] = [
  // Community Category
  { id: '1', name: 'Community - VIEW', category: 'Community', checked: true, appId: '1' },
  { id: '2', name: 'Define Community - CREATE', category: 'Community', checked: false, appId: '1' },
  { id: '3', name: 'Define Community - VIEW', category: 'Community', checked: true, appId: '1' },
  { id: '4', name: 'Define Community - EDIT', category: 'Community', checked: false, appId: '1' },
  { id: '5', name: 'Define Community - DELETE', category: 'Community', checked: false, appId: '1' },
  {
    id: '6',
    name: 'Domain Configuration - VIEW',
    category: 'Community',
    checked: false,
    appId: '1',
  },
  {
    id: '7',
    name: 'Domain Configuration - EDIT',
    category: 'Community',
    checked: false,
    appId: '1',
  },
  {
    id: '8',
    name: 'Domain Configuration - DELETE',
    category: 'Community',
    checked: false,
    appId: '1',
  },
  {
    id: '9',
    name: 'Email Configuration - CREATE',
    category: 'Community',
    checked: false,
    appId: '1',
  },
  {
    id: '10',
    name: 'Email Configuration - VIEW',
    category: 'Community',
    checked: false,
    appId: '1',
  },
  {
    id: '11',
    name: 'Email Configuration - EDIT',
    category: 'Community',
    checked: false,
    appId: '1',
  },
  {
    id: '12',
    name: 'Email Configuration - DELETE',
    category: 'Community',
    checked: false,
    appId: '1',
  },

  // Space Category
  { id: '13', name: 'Space - CREATE', category: 'Space', checked: false, appId: '2' },
  { id: '14', name: 'Space - VIEW', category: 'Space', checked: true, appId: '2' },
  { id: '15', name: 'Space - EDIT', category: 'Space', checked: false, appId: '2' },
  { id: '16', name: 'Space - DELETE', category: 'Space', checked: false, appId: '2' },
];

const PermissionsPage: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>(MOCK_PERMISSIONS);

  const { roles, isLoading: isRolesLoading } = useRoles();
  const availableApps = getAvailableApps();

  const roleOptions = useMemo(
    () => [
      { label: 'Select Role', value: '' },
      ...roles.map((role: Role) => ({ label: role.name, value: role.id })),
    ],
    [roles],
  );

  const appOptions = useMemo(
    () => [
      { label: 'Select App', value: '' },
      ...availableApps.map((app) => ({ label: app.name, value: app.id })),
    ],
    [availableApps],
  );

  const filteredPermissions = useMemo(() => {
    if (!selectedAppId) return permissions;
    return permissions.filter((p) => p.appId === selectedAppId);
  }, [permissions, selectedAppId]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    filteredPermissions.forEach((perm) => {
      if (!groups[perm.category]) {
        groups[perm.category] = [];
      }
      groups[perm.category].push(perm);
    });
    return groups;
  }, [filteredPermissions]);

  const handleTogglePermission = (id: string) => {
    setPermissions((prev) => prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)));
  };

  const handleAllowAll = (category: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.category === category ? { ...p, checked: true } : p)),
    );
  };

  const handleRevokeAll = (category: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.category === category ? { ...p, checked: false } : p)),
    );
  };

  const isPartial = (category: string) => {
    const group = groupedPermissions[category];
    const checkedCount = group.filter((p) => p.checked).length;
    return checkedCount > 0 && checkedCount < group.length;
  };

  // const isAllChecked = (category: string) => {
  //   const group = groupedPermissions[category];
  //   return group.every((p) => p.checked);
  // };

  if (isRolesLoading) {
    return (
      <div className={styles.loader}>
        <Loader2 className={styles.spin} size={32} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Permissions" subtitle="Control feature-level access for roles." />

      <div className={styles.permissionsContainer}>
        <div className={styles.filterSection}>
          <div className={styles.filterGroup}>
            <label>Role</label>
            <div className={styles.select}>
              <Select
                options={roleOptions}
                value={selectedRoleId}
                onChange={(val) => setSelectedRoleId(val as string)}
              />
            </div>
          </div>
          <div className={styles.filterGroup}>
            <label>App</label>
            <div className={styles.select}>
              <Select
                options={appOptions}
                value={selectedAppId}
                onChange={(val) => setSelectedAppId(val as string)}
              />
            </div>
          </div>
        </div>

        <div className={styles.permissionGroups}>
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} className={styles.groupCard}>
              <div className={styles.groupHeader}>
                <div className={styles.groupInfo}>
                  <h3>{category}</h3>
                  {isPartial(category) && <span className={styles.partialBadge}>Partial</span>}
                </div>
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
              </div>
              <div className={styles.groupBody}>
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className={`${styles.permissionCard} ${perm.checked ? styles.checked : ''}`}
                    onClick={() => handleTogglePermission(perm.id)}
                  >
                    <Checkbox
                      checked={perm.checked}
                      onChange={() => {}} // Handled by div click
                      className={styles.checkbox}
                    />
                    <span className={styles.permissionLabel}>{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionsPage;
