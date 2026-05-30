import { useState, useMemo } from 'react';
import { Check, X, Loader2, Save, AlertCircle } from 'lucide-react';

import { PageHeader, Checkbox } from '../../components/common';
import { Select } from '../../components/common';
import { usePlatformRoles } from '../../features/platform/roles/hooks';
import { useAppsList } from '../../features/platform/apps/hooks';
import {
  useRolePermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '../../features/access/permissions/hooks/usePermissions';

import styles from './PlatformAccessPermissionsPage.module.scss';

import type { SelectOption } from '../../components/common/Select/Select';

interface Permission {
  id: string;
  name: string;
  category: string;
  checked: boolean;
  moduleId: string;
  actionId: string;
}

const EMPTY: Permission[] = [];

const PlatformAccessPermissionsPage = () => {
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [localPerms, setLocalPerms] = useState<Permission[]>([]);
  const [prevServerPerms, setPrevServerPerms] = useState<Permission[]>([]);

  const { data: rolesResp, isLoading: isRolesLoading } = usePlatformRoles();
  const roles = useMemo(() => rolesResp?.data ?? [], [rolesResp]);

  const { data: appsResp } = useAppsList();
  const apps = useMemo(() => appsResp?.data ?? [], [appsResp]);

  const { data: serverPerms = EMPTY, isPending: isPermsLoading } =
    useRolePermissionsQuery(selectedRoleId);

  const { mutate: savePerms, isPending: isSaving } = useUpdateRolePermissionsMutation();

  // Sync server → local when role changes or fresh data arrives
  if (serverPerms !== prevServerPerms) {
    setPrevServerPerms(serverPerms);
    setLocalPerms(serverPerms);
  }

  const isDirty = JSON.stringify(localPerms) !== JSON.stringify(serverPerms);

  const appOptions: SelectOption[] = useMemo(
    () => [{ label: 'All apps', value: '' }, ...apps.map((a) => ({ label: a.name, value: a.id }))],
    [apps],
  );

  const roleOptions: SelectOption[] = useMemo(() => {
    const filtered = selectedAppId ? roles.filter((r) => r.app_id === selectedAppId) : roles;
    return [
      { label: 'Select a role…', value: '' },
      ...filtered.map((r) => ({ label: r.name, value: r.id })),
    ];
  }, [roles, selectedAppId]);

  const handleAppChange = (val: string | number) => {
    setSelectedAppId(String(val));
    setSelectedRoleId('');
  };

  const handleRoleChange = (val: string | number) => {
    const id = String(val);
    setSelectedRoleId(id);
    const role = roles.find((r) => r.id === id);
    if (role?.app_id) setSelectedAppId(role.app_id);
  };

  const grouped = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    for (const p of localPerms) {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }, [localPerms]);

  const toggle = (id: string) =>
    setLocalPerms((prev) => prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)));

  const allowAll = (category: string) =>
    setLocalPerms((prev) =>
      prev.map((p) => (p.category === category ? { ...p, checked: true } : p)),
    );

  const revokeAll = (category: string) =>
    setLocalPerms((prev) =>
      prev.map((p) => (p.category === category ? { ...p, checked: false } : p)),
    );

  const isPartial = (category: string) => {
    const g = grouped[category];
    const n = g.filter((p) => p.checked).length;
    return n > 0 && n < g.length;
  };

  const handleSave = () => {
    if (!selectedRoleId) return;
    savePerms({
      roleId: selectedRoleId,
      permissions: localPerms.map((p) => ({
        module_id: p.moduleId,
        action_id: p.actionId,
        checked: p.checked,
      })),
    });
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
      <div className={styles.headerRow}>
        <PageHeader
          title="Access Permissions"
          subtitle="Assign module-level access to platform role templates."
        />
        {selectedRoleId && (
          <button
            className={`${styles.saveBtn} ${isDirty ? styles.saveDirty : styles.saveClean}`}
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? <Loader2 className={styles.spin} size={15} /> : <Save size={15} />}
            Save changes
          </button>
        )}
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>App</label>
          <Select
            options={appOptions}
            value={selectedAppId}
            onChange={handleAppChange}
            placeholder="All apps"
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Role</label>
          <Select
            options={roleOptions}
            value={selectedRoleId}
            onChange={handleRoleChange}
            placeholder="Select a role…"
          />
        </div>
      </div>

      <div className={styles.infoBar}>
        <AlertCircle size={14} />
        Permissions here are applied to template roles. They are cloned to each new organisation on
        creation.
      </div>

      {!selectedRoleId ? (
        <div className={styles.empty}>Select an app and a role to configure permissions.</div>
      ) : isPermsLoading ? (
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={28} />
        </div>
      ) : localPerms.length === 0 ? (
        <div className={styles.empty}>
          No modules found for this role's app. Add modules under App &amp; Modules → Modules first.
        </div>
      ) : (
        <div className={styles.groups}>
          {Object.entries(grouped).map(([category, perms]) => (
            <div key={category} className={styles.groupCard}>
              <div className={styles.groupHeader}>
                <div className={styles.groupTitle}>
                  <h3>{category}</h3>
                  {isPartial(category) && <span className={styles.partial}>Partial</span>}
                </div>
                <div className={styles.groupActions}>
                  <button className={styles.btnAllow} onClick={() => allowAll(category)}>
                    <Check size={14} /> Allow all
                  </button>
                  <button className={styles.btnRevoke} onClick={() => revokeAll(category)}>
                    <X size={14} /> Revoke all
                  </button>
                </div>
              </div>
              <div className={styles.groupBody}>
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className={`${styles.permCard} ${perm.checked ? styles.permChecked : ''}`}
                    onClick={() => toggle(perm.id)}
                  >
                    <Checkbox checked={perm.checked} onChange={() => {}} className={styles.cb} />
                    <span className={styles.permLabel}>{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlatformAccessPermissionsPage;
